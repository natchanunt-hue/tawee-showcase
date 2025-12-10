import * as LucideIcons from "lucide-react";

export const nineZeros = [
  {
    id: 1,
    title: "Zero Low Education",
    titleTh: "การศึกษาต่ำกว่าปริญญาตรีเป็นศูนย์",
    icon: "GraduationCap",
    goal: "ยกระดับคะแนน PISA ให้สูงกว่าค่าเฉลี่ย OECD (485 คะแนน) และสร้างหลักประกันเรียนฟรี",
    customStat: "Target: PISA > 485",
    activeColor: "text-teal-600",
    activeBorder: "border-teal-500",
    activeShadow: "shadow-teal-100",
    activeBg: "bg-teal-50",
    details: {
      description: "ลงทุนสร้างทุนมนุษย์คุณภาพ ที่พร้อมสำหรับโลกยุคใหม่ ผ่านการปฏิรูประบบการเรียนรู้ที่เน้นทักษะ (Skill-Based), การเข้าถึงเทคโนโลยี AI, และความสามารถในการสื่อสารสากล",
      mechanisms: [
        "เรียนฟรีถึงปริญญาตรี (ในสาขาที่ตลาดต้องการ) และเรียนฟรีในสายอาชีพ",
        "ระบบ 2 ภาษา (ไทย/อังกฤษ) และ 3 ภาษา (จีน/มลายู) ในพื้นที่จังหวัดชายแดนใต้",
        "กองทุน AI เพื่อชาติ : สร้างโปรแกรมเมอร์และบุคลากร 100,000 คน"
      ],
      graphTitle: "เป้าหมายคะแนน PISA (OECD Average)",
      graphs: [
        { label: "คะแนน PISA ปัจจุบัน", value: "~400", percent: 80, color: "bg-amber-500" },
        { label: "เป้าหมาย (ค่าเฉลี่ย OECD)", value: "485", percent: 97, color: "bg-teal-600" }
      ],
      source: "ข้อมูลจาก : OECD PISA",
      // [NEW] ลิงก์อ้างอิง
      sourceUrl: "https://www.oecd.org/pisa/pisa-2022-results.htm" 
    }
  },
  {
    id: 2,
    title: "Zero Injustice",
    titleTh: "ความไม่เป็นธรรมเป็นศูนย์",
    icon: "Scale",
    goal: "ลดคดีพิพาทเล็กน้อยที่เข้าสู่ศาลลง 30% ผ่านกลไกยุติธรรมชุมชน",
    customStat: "ลดคดีขึ้นศาล -30%",
    activeColor: "text-teal-700",
    activeBorder: "border-teal-600",
    activeShadow: "shadow-teal-100",
    activeBg: "bg-teal-50",
    details: {
      description: "คืนความยุติธรรมให้ประชาชนทุกคน เข้าถึงกระบวนการยุติธรรมได้ง่าย รวดเร็ว และมีต้นทุนต่ำ",
      mechanisms: [
        "ปฏิรูปกระบวนการยุติธรรม : ลดขั้นตอน ลดค่าใช้จ่าย ให้ 'ยุติธรรมชุมชน' เป็นกลไกหลัก",
        "กองทุนยุติธรรม : ช่วยเหลือค่าใช้จ่ายทางกฎหมาย/ค่าทนายความ ให้ผู้ยากไร้",
        "ลดความแออัดในเรือนจำ : ใช้มาตรการคุมประพฤติ (กำไล EM) แทนการจำคุกในคดีไม่รุนแรง"
      ],
      graphTitle: "เป้าหมายลดปริมาณคดีขึ้นศาล",
      graphs: [
        { label: "ปริมาณคดีพิพาทปัจจุบัน", value: "100%", percent: 100, color: "bg-amber-500" },
        { label: "เป้าหมาย (ลดลง 30%)", value: "70%", percent: 70, color: "bg-teal-600" }
      ],
      source: "ข้อมูลจาก : กรมคุ้มครองสิทธิฯ",
      sourceUrl: "https://www.rlpd.go.th/"
    }
  },
  {
    id: 3,
    title: "Zero Poverty",
    titleTh: "ความยากจนเป็นศูนย์",
    icon: "Wallet",
    goal: "ระบบ NIT (ภาษีเงินได้ติดลบ) ประกันรายได้พื้นฐาน ปิดช่องว่างความยากจน",
    customStat: "ช่วยคนจน 4.4 ล้านคน",
    activeColor: "text-teal-800",
    activeBorder: "border-teal-700",
    activeShadow: "shadow-teal-100",
    activeBg: "bg-teal-50",
    details: {
      description: "สร้าง 'หลักประกันรายได้ขั้นพื้นฐาน' เพื่อให้ทุกคนยืนได้ด้วยตัวเอง และเป็นกำลังสำคัญขับเคลื่อนเศรษฐกิจฐานราก",
      mechanisms: [
        "ระบบ NIT (ภาษีเงินได้ติดลบ) : รัฐรับประกันรายได้ขั้นต่ำให้ครัวเรือน",
        "สวัสดิการถ้วนหน้า : ปรับเบี้ยยังชีพ (ผู้สูงอายุ, เด็ก) ให้สอดคล้องค่าครองชีพ",
        "สร้างอาชีพฐานราก : สนับสนุน SME และสหกรณ์ชุมชน เข้าถึงแหล่งทุนดอกเบี้ยต่ำ"
      ],
      graphTitle: "กลุ่มเป้าหมาย (รายได้ต่ำกว่าเส้นความยากจน)",
      graphs: [
        { label: "ประชากรทั้งหมด", value: "66 ล้านคน", percent: 100, color: "bg-slate-300" },
        { label: "คนจน (รายได้ < 2,803 บ.)", value: "4.4 ล้านคน", percent: 7, color: "bg-red-500" }
      ],
      source: "ข้อมูลจาก : สภาพัฒน์ฯ",
      sourceUrl: "https://www.nesdc.go.th/"
    }
  },
  {
    id: 4,
    title: "Zero Inequality",
    titleTh: "ความเหลื่อมล้ำเป็นศูนย์",
    icon: "Users",
    goal: "ลดช่องว่างความเหลื่อมล้ำ (Gini Index) ผ่านภาษีอัตราก้าวหน้าและกระจายอำนาจ",
    customStat: "เป้าหมาย Gini < 0.35",
    activeColor: "text-emerald-600",
    activeBorder: "border-emerald-500",
    activeShadow: "shadow-emerald-100",
    activeBg: "bg-emerald-50",
    details: {
      description: "สร้างสังคมที่ทุกคนมี 'โอกาสที่ทัดเทียม' ในการเติบโต ผ่านการกระจายอำนาจ งบประมาณ และทรัพยากรอย่างเป็นธรรม",
      mechanisms: [
        "ปฏิรูปงบประมาณ : กระจายอำนาจการคลัง ให้ท้องถิ่นมีงบและอำนาจตัดสินใจ",
        "ปรับโครงสร้างภาษี : ภาษีอัตราก้าวหน้า (ภาษีที่ดิน, ภาษีมรดก)",
        "ทลายทุนผูกขาด : สร้างการแข่งขันที่เสรี เพื่อให้คนตัวเล็กเติบโตได้"
      ],
      graphTitle: "ดัชนีความเหลื่อมล้ำ (Gini Index)",
      graphs: [
        { label: "ค่า Gini ปัจจุบัน (ยิ่งสูงยิ่งเหลื่อมล้ำ)", value: "0.43", percent: 86, color: "bg-amber-500" },
        { label: "เป้าหมาย (ลดลง)", value: "< 0.35", percent: 70, color: "bg-teal-600" }
      ],
      source: "ข้อมูลจาก : World Bank/สศช.",
      sourceUrl: "https://data.worldbank.org/indicator/SI.POV.GINI?locations=TH"
    }
  },
  {
    id: 5,
    title: "Zero Unfair Debt", 
    titleTh: "หนี้สินที่ไม่เป็นธรรม เป็นศูนย์", 
    icon: "Banknote", 
    goal: "โครงการฟื้นฟูลูกหนี้แห่งชาติ และล้างหนี้นอกระบบ ลดหนี้ครัวเรือน/GDP",
    customStat: "หนี้ครัวเรือน < 80% GDP",
    activeColor: "text-emerald-700",
    activeBorder: "border-emerald-600",
    activeShadow: "shadow-emerald-100",
    activeBg: "bg-emerald-50",
    details: {
      description: "ดำเนิน 'โครงการฟื้นฟูลูกหนี้แห่งชาติ' อย่างเป็นธรรม และสนับสนุนกองทุนหมู่บ้านให้เข้มแข็ง",
      mechanisms: [
        "ยกระดับ 'มหกรรมไกล่เกลี่ยหนี้' สู่กลไกถาวรระดับจังหวัด",
        "พักหนี้และปรับโครงสร้าง : พักหนี้กลุ่มเปราะบาง และปรับโครงสร้าง NPL",
        "ฟื้นฟูกองทุนหมู่บ้าน : เป็นแหล่งเงินกู้ฉุกเฉินดอกเบี้ยต่ำแทนหนี้นอกระบบ"
      ],
      graphTitle: "สัดส่วนหนี้ครัวเรือนต่อ GDP",
      graphs: [
        { label: "หนี้ครัวเรือนปัจจุบัน", value: "91.3%", percent: 91.3, color: "bg-red-500" },
        { label: "เพดานเฝ้าระวัง (สากล)", value: "80%", percent: 80, color: "bg-yellow-400" }
      ],
      source: "ข้อมูลจาก : ธนาคารแห่งประเทศไทย",
      sourceUrl: "https://www.bot.or.th/"
    }
  },
  {
    id: 6,
    title: "Zero Homelessness",
    titleTh: "การไร้ที่อยู่/ที่ดินทำกินเป็นศูนย์",
    icon: "Home",
    goal: "ธนาคารที่ดิน (Land Bank) จัดสรรที่ดินรัฐที่รกร้างให้ผู้ยากไร้และเกษตรกร",
    customStat: "ที่ดินทำกิน 100%",
    activeColor: "text-emerald-800",
    activeBorder: "border-emerald-700",
    activeShadow: "shadow-emerald-100",
    activeBg: "bg-emerald-50",
    details: {
      description: "มอง 'บ้านและที่ดิน' เป็นสิทธิมนุษยชนขั้นพื้นฐาน รัฐต้องจัดสรรและรับรองสิทธิอย่างมั่นคง",
      mechanisms: [
        "ธนาคารที่ดิน (Land Bank) : นำที่ดินรัฐที่รกร้างมาจัดสรรให้เกษตรกร",
        "โฉนดชุมชน : ให้สิทธิชุมชนในการจัดการที่ดินร่วมกัน",
        "ปฏิรูปการเคหะ : สร้างบ้านเช่าราคาถูก (ไม่เกิน 1,500 บ./เดือน)"
      ],
      graphTitle: "สัดส่วนเกษตรกรไร้ที่ดินทำกิน",
      graphs: [
        { label: "เกษตรกรไม่มีที่ดิน (ต้องเช่า)", value: "59%", percent: 59, color: "bg-red-500" },
        { label: "มีที่ดินของตนเอง", value: "41%", percent: 41, color: "bg-teal-200" }
      ],
      source: "ข้อมูลจาก : ส.ป.ก./กรมที่ดิน",
      sourceUrl: "https://www.alro.go.th/"
    }
  },
  {
    id: 7,
    title: "Zero Unemployment",
    titleTh: "การว่างงานเป็นศูนย์",
    icon: "Briefcase",
    goal: "Job Guarantee ระบบจ้างงานเพื่อสังคม รองรับผู้ว่างงานชั่วคราว",
    customStat: "+1 ล้านตำแหน่งงาน",
    activeColor: "text-cyan-600",
    activeBorder: "border-cyan-500",
    activeShadow: "shadow-cyan-100",
    activeBg: "bg-cyan-50",
    details: {
      description: "รัฐมีหน้าที่จัดหางานให้ประชาชนอย่างทั่วถึง ส่งเสริมการจ้างงานที่มีคุณค่า และพัฒนาแรงงานให้ตอบโจทย์ยุคใหม่",
      mechanisms: [
        "Job Guarantee : ระบบจ้างงานเพื่อสังคม รองรับผู้ว่างงานชั่วคราว",
        "แพลตฟอร์ม Matching : จับคู่ งาน-คน-ทักษะ ระดับประเทศ",
        "ส่งเสริมการจ้างงานผู้สูงอายุ : สิทธิประโยชน์ทางภาษีแก่บริษัท"
      ],
      graphTitle: "เป้าหมายการจ้างงานใหม่ (Job Guarantee)",
      graphs: [
        { label: "ตำแหน่งงานเพื่อสังคม", value: "1,000,000", percent: 100, color: "bg-cyan-500" }
      ],
      source: "ข้อมูลจาก : สนง.สถิติแห่งชาติ",
      sourceUrl: "https://www.nso.go.th/"
    }
  },
  {
    id: 8,
    title: "Zero Corruption",
    titleTh: "ทุจริต ยาเสพติด อาชญากรรมเป็นศูนย์",
    icon: "Shield",
    goal: "ยกระดับดัชนีคอร์รัปชัน (CPI) และยึดทรัพย์ตัดวงจรยาเสพติด",
    customStat: "CPI > 50 คะแนน",
    activeColor: "text-cyan-700",
    activeBorder: "border-cyan-600",
    activeShadow: "shadow-cyan-100",
    activeBg: "bg-cyan-50",
    details: {
      description: "สร้างสังคมโปร่งใสและปลอดภัย ด้วยระบบตรวจสอบเข้มงวด และการป้องกันยาเสพติดเชิงรุก",
      mechanisms: [
        "ยึดทรัพย์ตัดวงจรยาเสพติด : เน้นยึดทรัพย์สินที่ได้มาโดยมิชอบ",
        "ปฏิรูประบบตำรวจและ DSI : ให้อิสระในการทำงาน แยกงานสอบสวน",
        "ชุมชนเฝ้าระวัง : ใช้ยุติธรรมชุมชนเป็นหูเป็นตาแจ้งเบาะแส"
      ],
      graphTitle: "ดัชนีการรับรู้การทุจริต (CPI)",
      graphs: [
        { label: "คะแนนปัจจุบัน (35/100)", value: "35", percent: 35, color: "bg-red-500" },
        { label: "เป้าหมาย (โปร่งใสขึ้น)", value: "> 50", percent: 50, color: "bg-teal-600" }
      ],
      source: "ข้อมูลจาก : Transparency Int'l",
      sourceUrl: "https://www.transparency.org/en/cpi/2023"
    }
  },
  {
    id: 9,
    title: "Zero Monopoly",
    titleTh: "การผูกขาด/สัมปทานไม่เป็นธรรมเป็นศูนย์",
    icon: "BadgeAlert",
    goal: "กฎหมายแข่งขันทางการค้า (สั่งแยกกิจการได้) เปิดเผยสัญญาสัมปทานรัฐ",
    customStat: "เลิกทุนผูกขาด",
    activeColor: "text-cyan-800",
    activeBorder: "border-cyan-700",
    activeShadow: "shadow-cyan-100",
    activeBg: "bg-cyan-50",
    details: {
      description: "ยุติระบบทุนผูกขาด 'เสือนอนกิน' ที่ผลักภาระให้ประชาชน ส่งเสริมการแข่งขันเสรีอย่างเป็นธรรม",
      mechanisms: [
        "แก้กฎหมายแข่งขันทางการค้า : เพิ่มอำนาจสั่ง 'แยกกิจการ' (Split)",
        "เปิดเผยสัญญาสัมปทาน : สัญญาของรัฐต้องเปิดเผยต่อสาธารณะ",
        "ส่งเสริม SME : สร้างแต้มต่อในการเข้าถึงตลาดภาครัฐ"
      ],
      graphTitle: "ความมั่งคั่งของกลุ่มทุนผูกขาด",
      graphs: [
        { label: "กลุ่มธุรกิจขนาดใหญ่ (5% ของระบบ)", value: "ครอง 90% ของความมั่งคั่ง", percent: 90, color: "bg-red-600" },
        { label: "ธุรกิจรายย่อย/SME", value: "ส่วนแบ่งที่เหลือ", percent: 10, color: "bg-slate-300" }
      ],
      source: "ข้อมูลจาก : TDRI/กขค.",
      sourceUrl: "https://tdri.or.th/"
    }
  },
];

export const getIcon = (iconName) => {
  const IconComponent = LucideIcons[iconName];
  return IconComponent || LucideIcons.HelpCircle; 
};