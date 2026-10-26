const scenes: Record<number,string> = {
  1:"/theme/hsk/hsk-1-ink.png",2:"/theme/hsk/hsk-2-ink.png",
  3:"/theme/phong_canh_thuy_mac_ben_ho_suong_som.jpg",4:"/theme/phong_canh_thuy_mac_giua_suong_mo.jpg",
  5:"/theme/tinh_vat_thu_phong_giua_son_thuy_mo_suong.jpg",6:"/theme/phong_canh_thuy_mac_voi_sach_cuon_va_tre.jpg",
  7:"/theme/hero-student-pavilion.jpg",8:"/theme/tinh_vat_tra_ben_canh_hoa_mai_dao.jpg",9:"/theme/dashboard/card-hsk.webp",
};
export function hskArtwork(level:number){return scenes[level]||"/theme/dashboard/banner-bg.webp";}
