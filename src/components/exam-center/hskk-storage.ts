import type { PairedHskkExam } from "@/lib/exam-center-core";

type Submission = {
  paperTitle: string;
  answers: Record<string, string>;
  completed: boolean;
};

async function submissions<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("hsk-exam-center", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("hskk-submissions");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction("hskk-submissions", mode);
      const request = run(transaction.objectStore("hskk-submissions"));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error ?? request.error);
    });
  } finally {
    database.close();
  }
}

export async function readHskkSubmission(id: string, exam: PairedHskkExam) {
  let saved: Submission | undefined;
  try {
    saved = await submissions("readonly", store => store.get(id));
  } catch {
    // Legacy submissions can still be read if IndexedDB is unavailable.
  }
  if (!saved) {
    try {
      saved = JSON.parse(localStorage.getItem(`hskk_sub_${id}`) || "null");
    } catch {
      // Local storage may also be unavailable.
    }
  }
  const questions = exam.groups.flatMap(group => group.questions || []);
  const answers = Object.fromEntries(questions.flatMap(({ id }) =>
    typeof saved?.answers?.[id] === "string" && saved.answers[id] ? [[id, saved.answers[id]]] : []
  ));
  return { answers, completed: saved?.completed === true && (saved.paperTitle === exam.title || Object.keys(answers).length > 0) };
}

export async function saveHskkSubmission(id: string, submission: Submission) {
  await submissions("readwrite", store => store.put(submission, id));
}
