import Image from "next/image";
import { hskArtwork } from "@/lib/hsk-theme";
import styles from "./Ink.module.css";
export default function InkHero({title,description,eyebrow,level,children}:{title:string;description?:string;eyebrow?:string;level?:number;children?:React.ReactNode}){return <section className={styles.hero}><Image src={level?hskArtwork(level):"/theme/dashboard/banner-bg.webp"} alt="" fill sizes="(max-width:1024px) 100vw, 1200px" className={styles.heroImage}/>{eyebrow&&<p className={styles.eyebrow}>{eyebrow}</p>}<h2 className={styles.title}>{title}</h2>{description&&<p className={styles.description}>{description}</p>}{children&&<div className="mt-5">{children}</div>}</section>;}
