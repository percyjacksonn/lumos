/* ==============================================================
   SUPABASE SETUP
   FIX: the original supabaseUrl had "/rest/v1/" appended to it,
   which breaks supabase-js (storage/auth calls need the bare
   project URL). Use just the project URL below.
================================================================= */
const supabaseUrl = "https://jlnbezpewkuqrwmcljdv.supabase.co";
const supabaseKey = "sb_publishable_9mvDqyktUkE0JfMAJv7ukA_sJXNFxdz";

supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
console.log("Supabase connected:", supabase);

// Name of the bucket you created in Supabase → Storage
const SUPABASE_BUCKET = "study-materials";

// Turns a file path inside the bucket into a public URL.
// Only works if the bucket (or the file's folder) is set to Public.
// If you made the bucket Private, swap this for createSignedUrl() instead.
function getPublicFileUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  return data ? data.publicUrl : null;
}

const hash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;
  return h;
};

const DEPARTMENTS = [
  { id: "cse", name: "CSE", full: "Computer Science & Engineering", icon: "cpu", blurb: "Notes, PYQs, labs and more for every CS core.", accent: "coral" },
  { id: "ece", name: "ECE", full: "Electronics & Communication Engineering", icon: "radio", blurb: "Circuits, signals and communication, sorted by unit.", accent: "sky" },
  { id: "eee", name: "EEE", full: "Electrical & Electronics Engineering", icon: "zap", blurb: "Power systems, machines and control, semester by semester.", accent: "sun" },
  { id: "mech", name: "MECH", full: "Mechanical Engineering", icon: "cog", blurb: "Thermo, design and manufacturing notes, one shelf.", accent: "leaf" },
  { id: "aids", name: "AI & DS", full: "Artificial Intelligence & Data Science", icon: "sparkles", blurb: "ML, stats and data notes from your seniors.", accent: "coral" },
  { id: "it", name: "AI & ML", full: "Artificial Intelligence & Machine Learning", icon: "globe", blurb: "Web, networks and databases, semester by semester.", accent: "sun" },
  { id: "bme", name: "BME", full: "Biomedical Engineering", icon: "activity", blurb: "Instrumentation and physiology notes, all verified.", accent: "leaf" },
];

const GENERIC_SUBJECTS = [
  "Engineering Mathematics", "Engineering Physics", "Engineering Chemistry", "Basic Electrical Engineering",
  "Programming Fundamentals", "Environmental Science", "Data Structures", "Operating Systems",
  "Computer Networks", "Object Oriented Programming", "Software Engineering", "Web Technologies",
  "Machine Learning", "Cloud Computing", "Digital Electronics", "Microprocessors",
  "Control Systems", "Power Systems", "Electrical Machines", "Signals and Systems",
  "Thermodynamics", "Fluid Mechanics", "Strength of Materials", "Manufacturing Processes",
  "Structural Analysis", "Surveying", "Concrete Technology", "Biomedical Instrumentation",
  "Discrete Mathematics", "Probability & Statistics",
];

const TEACHERS = [
  "Dr. Priya Sharma", "Mrs. Kavitha Reddy", "Mr. Arun Kumar", "Dr. Sneha Iyer",
  "Mr. Rahul Verma", "Dr. Ramesh Nair", "Ms. Anjali Rao", "Dr. Vikram Sethi",
];
/* ==============================================================
   CURRICULUM — set exact subjects, teachers, codes & credits here.
   Key = "deptId-semesterNumber", e.g. "cse-3", "ece-5".
   Any dept/sem NOT listed here keeps using the automatic generator.
   Delete this comment block's example once you add your real data.
================================================================= */
const CURRICULUM = {
  "cse-3": {
    subjects: [
      { name: "Data Structures & Algorithm",    code: "24CS301", credits: 4, teachers: ["Mrs.R.Meenakshiammal"] },
      { name: "Database Management Systems",    code: "24CS304", credits: 4, teachers: ["Mrs.Sindhuja"] },
     { name: "Microprocessors, Microcontrollers and Interfacing Techniques",    code: "CS30991", credits: 4, teachers: ["Mrs.R.Thazleema Banu"] },
      { name: "OOPS using Java Programming",               code: "24CS302", credits: 3, teachers: ["Dr.R.Sahila Devi"] },
      { name: "Computer Architecture and Organization",          code: "24CS303", credits: 4, teachers: ["Mrs.Anushlin Leena"] },
      { name: " Probability, random Process and Statistics",    code: "24MA301", credits: 4, teachers: ["Dr.P.C.Priyanaka Nair"] },
    ],
  },
  "cse-4": {
    subjects: [
      { name: "Discrete Mathematics and Linear Algebra", code: "24MA402", credits: 4},
      { name: "Introduction to Operating Systems",    code: "CS3451", credits: 4},
      { name: "Database Management Systems",     code: "CS3492", credits: 3  },
      { name: "Algorithms",          code: "CS3401", credits: 4 },
      { name: "Environmental Sciences and Sustainability",          code: "GE3451", credits: 4,  },
      { name: "Operating Systems Laboratory",          code: "CS3461", credits: 4,  },
      { name: "Database Management Systems Laboratory",          code: "CS3481", credits: 4 },
      { name: "Cryptography and Cyber Security",    code: "CS3491", credits: 4 },
    ],
  },
  "cse-1": {
    subjects: [
      { name: " Professional English I",               code: "24HS101", credits: 3 },
      { name: "Matrices and Calculus",    code: "24MA101", credits: 4 },
      { name: " Engineering Physics",               code: "24PH101", credits: 3 },
      { name: "Engineering Chemistry",          code: "24CY101", credits: 3 },
      { name: "Problem Solving and Python Programming",    code: "24GE101", credits: 3},
            { name: " Heritage of Tamils",               code: "24GE102", credits: 1 },
      { name: " Python Programming Laboratory",               code: "24GE111", credits: 2 },
      { name: "Physics and Chemistry Laboratory",               code: "24BS111", credits: 2 },

    ],
  },
  "cse-2": {
    subjects: [
      { name: "Professional English II",               code: "24HS201", credits: 2},
      { name: "Statistics and Numerical Methods",    code: "24MA201", credits: 4 },
            { name: "Tamils and Technology / தமிழரும் தொழில்நுட்பமும்",               code: "24GE202", credits: 1 },
      { name: "Physics for Information Science",               code: "24PH201", credits: 3 },
      { name: "Basic Electrical and Electronics Engineering",          code: "24EE201", credits:4 },
      { name: "Programming in C",    code: "24CS201", credits:3},
            { name: "Engineering Practices Laboratory",    code: "24GE202", credits:2 },
                  { name: "Engineering Graphics",    code: "24GE201", credits:4 },
            { name: "Programming in C Laboratory",    code: "24CS271", credits:2 },


    ],
  },
  "cse-5": {
    subjects: [
      { name: "Computer Networks",               code: "CS3591", credits: 4 },
      { name: " Compiler Design ",    code: "CS3501", credits: 4 },
      { name: " Cryptography and Cyber Security",               code: "CB3491", credits: 3 },
      { name: "Compiler Design Laboratory ",          code: "CS3551", credits: 4 },
      { name: "Distributed Computing",          code: "CS3551", credits: 4 },
      { name: "Computer Networks Laboratory",          code: "CS3561", credits: 4 },
      { name: "Professional Elective I",     credits: 4 },
      { name: "Professional Elective II",     credits: 4 },
    ],
  },
  "cse-6": {
    subjects: [
      { name: "Embedded Systems and IoT",               code: "CS3691", credits: 4 },
      { name: "Software Engineering",    code: "CS3601", credits: 4 },
      { name: "Artificial Intelligence & Machine Learningg",               code: "CS3651", credits: 3 },  { name: "Professional Elective I",     credits: 4 },
      { name: "Open Elective I",     credits: 4 },
  { name: "Professional Elective III",     credits: 4 },
      { name: "Professional Elective IV",     credits: 4 },
      { name: "Software Engineering Laboratory / Mini Project",          code: "CS3611", credits: 4 },

      { name: "Artificial Intelligence & Machine Learning Laboratory",    code: "CS3661", credits: 4 },
    ],
  },
  "cse-7": {
    subjects: [
      { name: "Human Values and Ethics",               code: "GE3751", credits: 4, teachers: ["Dr. Priya Sharma"] },
      { name: " Principles of Management  ",    code: "GE3752", credits: 4, teachers: ["Dr. Priya Sharma", "Mrs. Kavitha Reddy"] },
      { name: "Total Quality Management",               code: "GE3753", credits: 3, teachers: ["Mr. Arun Kumar"] },
      { name: " Engineering Economics and Financial Accounting  ",          code: "CS304", credits: 4, teachers: ["Dr. Sneha Iyer"] },
      { name: "Human Resource Management",    code: "GE3754", credits: 4, teachers: ["Dr. Ramesh Nair"] },      
      { name: "Open Elective II",     credits: 4 },
      { name: "Open Elective II",     credits: 4 },
      { name: "Open Elective IV",     credits: 4 },     
       { name: " Summer Internship (carried out after Sem 6)   I",     credits: 4 },


    ],
  },
  "cse-8": {
    subjects: [
             { name: " Project Work / Project Work cum Internship",     credits: 4 },

      
    ],
  },
  
  // "ece-5": { subjects: [ { name: "...", code: "EC501", credits: 4, teachers: ["..."] }, ... ] },
};
  const REAL_RESOURCES = {
  "cse-3": [
    // ===== Data Structures & Algorithm (subjectIndex 0) =====
    {
      subjectIndex: 0,
      type: "teacher-notes",
      unit: 1,
      teacher: "Mrs.R.Meenakshiammal",
      title: "Unit 1 Notes",
      filePath: "unit1-dsa-notes.pdf",    },
    {
      subjectIndex: 0,
      type: "teacher-notes",
      unit: 2,
      teacher: "Mrs.R.Meenakshiammal",
      title: "Unit 2 Notes",
      filePath: "unit2-dsa-notes.pdf",
    },
    {
      subjectIndex: 0,
      type: "teacher-notes",
      unit: 3,
      teacher: "Mrs.R.Meenakshiammal",
      title: "Unit 3 Notes",
      filePath: "unit3-dsa-notes.pdf",
    },
    {
      subjectIndex: 0,
      type: "teacher-notes",
      unit: 4,
      teacher: "Mrs.R.Meenakshiammal",
      title: "Unit 4 Notes",
      filePath: "unit4-dsa-notes.pdf",
    },
    {
      subjectIndex: 0,
      type: "teacher-notes",
      unit: 5,
      teacher: "Mrs.R.Meenakshiammal",
      title: "Unit 5 Notes",
      filePath: "unit5-dsa-notes.pdf",
    },
    {
      subjectIndex: 0,
      type: "lab",
      unit: '1 ,2 ,3 4',              // PYQs aren't unit-specific, so unit is null
      teacher: "Mrs.R.Meenakshiammal",
      title: "DSA Manual",
      filePath: "dsa-prg-1234.pdf",
    },

    {
      subjectIndex: 0,
      type: "lab",
      unit:' 5,6,7',             // PYQs aren't unit-specific, so unit is null
      teacher: "Mrs.R.Meenakshiammal",
      title: "DSA Manual",
      filePath: "dsa-prg-567.pdf",
    },

    {
      subjectIndex: 0,
      type: "lab",
      unit: '8,9',             // PYQs aren't unit-specific, so unit is null
      teacher: "Mrs.R.Meenakshiammal",
      title: "DSA Manual",
      filePath: "dsa-prg-89.pdf",
    },

    {
      subjectIndex: 0,
      type: "lab",
      unit: '10,11,12',          // PYQs aren't unit-specific, so unit is null
      teacher: "Mrs.R.Meenakshiammal",
      title: "DSA Manual",
      filePath: "dsa-prg101112.pdf",
    },

    {
      subjectIndex: 0,
      type: "lab-",
      unit: '14 15 ',         // PYQs aren't unit-specific, so unit is null
      teacher: "Mrs.R.Meenakshiammal",
      title: "DSA Manual",
      filePath: "dsa-prg-1415.pdf",
    },
    
    {
      subjectIndex: 0,
      type: "lab",
      unit: '16,17',          // PYQs aren't unit-specific, so unit is null
      teacher: "Mrs.R.Meenakshiammal",
      title: "DSA Manual",
      filePath: "dsa-prg-1617.pdf",
    },


    // ===== Database Management Systems (subjectIndex 1) =====
    {
      subjectIndex: 1,
      type: "lab",
      unit: 1,
      teacher: "Mrs.Sindhuja",
      title: "Lab Manual",
      filePath: "DBMS LAB MANUAL.docx",
    },
  
    {
      subjectIndex: 1,
      type: "teacher-notes",
      unit: '1,2,3',
      teacher: "Mrs.Sindhuja",
      title: "Unit 1,2, 3 Notes",
      filePath: "unit123-dbms-notes.pdf",
    },

    // ===== Microprocessors... (subjectIndex 2) =====
    {
      subjectIndex: 2,
      type: "lab",
      unit: null,              // labs generally aren't unit-specific either
      teacher: "Mrs.R.Thazleema Banu",
      title: "Microprocessors Lab Manual",
      filePath: "microprocessor lab manual-1.pdf",
    },
    
    {
      subjectIndex: 2,
      type: "teacher-notes",
      unit: '1,2',              // labs generally aren't unit-specific either
      teacher: "Mrs.R.Thazleema Banu",
      title: "Unit 1 and Unit 2 Notes",
      filePath: "unit1-micro-notes.pdf",
    },
    {
      subjectIndex: 2,
      type: "teacher-notes",
      unit: null,              // labs generally aren't unit-specific either
      teacher: "Mrs.R.Thazleema Banu",
      title: "Unit 3 Notes",
      filePath: "unit3-micro-notes.pdf",
    },

    // ===== OOPS using Java Programming (subjectIndex 3) =====
    {
      subjectIndex: 3,
      type: "teacher-notes",
      unit: 1,
      teacher: "Dr.R.Sahila Devi",
      title: "Unit 1 ",
      filePath: "unit1-java-notes .pdf",   // your existing sample file
    },
    {
      subjectIndex: 3,
      type: "teacher-notes",
      unit: 2,
      teacher: "Dr.R.Sahila Devi",
      title: "Unit-2 ",
      filePath: "unit2-java-notes.pdf",
    },

    // ===== Computer Architecture and Organization (subjectIndex 4) =====
    {
      subjectIndex: 4,
      type: "teacher-notes",
      unit: 1,
      teacher: "Mrs.Anushlin Leena",
      title: "Unit 1",
      filePath: "unit1-ca-notes.pdf",
    },
     // ===== Computer Architecture and Organization (subjectIndex 4) =====
    {
      subjectIndex: 4,
      type: "teacher-notes",
      unit: 2,
      teacher: "Mrs.Anushlin Leena",
      title: "Unit 2",
      filePath: "unit2-ca-notes.pdf",
    }, // ===== Computer Architecture and Organization (subjectIndex 4) =====
    {
      subjectIndex: 4,
      type: "teacher-notes",
      unit: 3,
      teacher: "Mrs.Anushlin Leena",
      title: "Unit 3",
      filePath: "unit3-ca-notes.pdf",
    },

    // ===== Probability, random Process and Statistics (subjectIndex 5) =====
    {
      subjectIndex: 5,
      type: "teacher-notes",
      unit: 1,
      teacher: "Dr.P.C.Priyanaka Nair",
      title: "Unit 1 Notes",
      filePath: "cse/sem3/probability/unit1-notes.pdf",
    },
  ],
}; 

const CATEGORIES = [
  { key: "teacher-notes", label: "Teacher Notes", emoji: "📚", desc: "Lecture and handwritten notes by faculty" },
  { key: "pyq", label: "Previous Year Papers", emoji: "📄", desc: "Solved and unsolved question papers" },
  { key: "important", label: "Important Questions", emoji: "⭐", desc: "High-yield questions worth revising first" },
  { key: "assignment", label: "Assignments", emoji: "📑", desc: "Graded and practice assignments" },
  { key: "lab", label: "Lab Materials", emoji: "🧪", desc: "Manuals, records and viva questions" },
  { key: "syllabus", label: "Syllabus", emoji: "📖", desc: "Official unit-wise course outline" },
  { key: "reference", label: "Reference Resources", emoji: "🔗", desc: "Extra reading picked by toppers" },
];
const CAT_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dateFromSeed = (seed) => {
  const h = hash(seed);
  const month = h % 10;
  const day = 1 + (h >> 4) % 27;
  return `${monthNames[month]} ${day}`;
};
const subjectCode = (deptName, sem, si) => `${deptName.replace(/[^A-Z]/g, "").slice(0, 3)}${sem}0${si + 1}`;

function makeResource({ subjectId, subjectName, type, unit, teacher, title, seed }) {
  const h = hash(seed);
  return {
    id: seed,
    subjectId, subjectName, type, unit, teacher, title,
    size: (1 + (h % 42) / 10).toFixed(1),
    date: dateFromSeed(seed),
    verified: h % 9 !== 0,
    downloads: 30 + (h % 640),
    filePath: null, // demo resource — no real file attached
    url: null,       // demo resource — view/download/copy will show a toast
  };
}

// Builds a resource object backed by a REAL file in Supabase Storage.
function makeRealResource({ subjectId, subjectName, type, unit, teacher, title, filePath, seed }) {
  return {
    id: seed,
    subjectId, subjectName, type, unit, teacher, title,
    size: null, // unknown client-side; check the file size in the Supabase dashboard if you want to show it
    date: dateFromSeed(seed),
    verified: true,
    downloads: 0,
    filePath,
    url: getPublicFileUrl(filePath),
  };
}
 function buildData() {
  const subjectsById = {};
  const resourcesById = {};
  const byDeptYearSem = {};

  DEPARTMENTS.forEach((dept, di) => {
    for (let year = 1; year <= 4; year++) {
      const sems = year === 1 ? [1, 2] : year === 2 ? [3, 4] : year === 3 ? [5, 6] : [7, 8];
      sems.forEach((sem) => {
        const curriculum = CURRICULUM[`${dept.id}-${sem}`];

        let subjectDefs;
        if (curriculum) {
          subjectDefs = curriculum.subjects;
        } else {
          const offset = (di * 7 + sem * 5) % GENERIC_SUBJECTS.length;
          const set = new Set();
          let k = 0;
          while (set.size < 4 && k < 12) { set.add(GENERIC_SUBJECTS[(offset + k * 3) % GENERIC_SUBJECTS.length]); k++; }
          subjectDefs = [...set].map((name) => ({ name, code: null, credits: null, teachers: null }));
        }

        const key = `${dept.id}-${year}-${sem}`;
        byDeptYearSem[key] = [];

        subjectDefs.forEach((def, si) => {
          const name = def.name;
          const subjectId = `${dept.id}-y${year}-s${sem}-${si}`;
          const h = hash(subjectId);

          let finalTeachers;
          if (def.teachers && def.teachers.length) {
            finalTeachers = def.teachers;
          } else {
            const count = h % 3 === 0 ? 2 : 1;
            finalTeachers = Array.from({ length: count }, (_, t) => TEACHERS[(h + t * 13) % TEACHERS.length]);
            finalTeachers = [...new Set(finalTeachers)];
          }

          const code = def.code || subjectCode(dept.name, sem, si);
          const credits = def.credits || (3 + (h % 2));
          const units = [1, 2, 3, 4, 5];
          const resources = [];

          units.forEach((u) => {
            finalTeachers.forEach((teacher, ti) => {
              resources.push(makeResource({ subjectId, subjectName: name, type: "teacher-notes", unit: u, teacher, title: `Unit ${u} Notes`, seed: `${subjectId}-tn-${u}-${ti}` }));
              
            });
            resources.push(makeResource({ subjectId, subjectName: name, type: "important", unit: u, teacher: finalTeachers[0], title: `Unit ${u} Important Questions`, seed: `${subjectId}-iq-${u}` }));
            if (hash(`${subjectId}${u}as`) % 3 === 0) {
              resources.push(makeResource({ subjectId, subjectName: name, type: "assignment", unit: u, teacher: finalTeachers[0], title: `Unit ${u} Assignment`, seed: `${subjectId}-as-${u}` }));
            }
          });
          [2025, 2024, 2023].forEach((yr) => {
            resources.push(makeResource({ subjectId, subjectName: name, type: "pyq", unit: null, teacher: finalTeachers[0], title: `${name} ${yr} Question Paper`, seed: `${subjectId}-pyq-${yr}` }));
          });
          resources.push(makeResource({ subjectId, subjectName: name, type: "syllabus", unit: null, teacher: finalTeachers[0], title: `${name} Syllabus`, seed: `${subjectId}-syl` }));
          resources.push(makeResource({ subjectId, subjectName: name, type: "reference", unit: null, teacher: finalTeachers[0], title: `${name} Reference Notes`, seed: `${subjectId}-ref` }));
          if (hash(`${subjectId}lab`) % 2 === 0) {
            resources.push(makeResource({ subjectId, subjectName: name, type: "lab", unit: null, teacher: finalTeachers[0], title: `${name} Lab Manual`, seed: `${subjectId}-lab` }));
          }

          // ==== REAL FILES INJECTION (NEW) ====
          // If REAL_RESOURCES has entries for this dept-sem + subject index,
          // add them as extra resource cards with working links.
          const realKey = `${dept.id}-${sem}`;
          if (REAL_RESOURCES[realKey]) {
            REAL_RESOURCES[realKey]
              .filter((f) => f.subjectIndex === si)
              .forEach((f, fi) => {
                resources.push(makeRealResource({
                  subjectId, subjectName: name,
                  type: f.type, unit: f.unit, teacher: f.teacher, title: f.title,
                  filePath: f.filePath,
                  seed: `${subjectId}-real-${fi}`,
                }));
              });
          }
// Keep only real resources that have a Supabase file URL.
// This removes all the fake demo cards.
const realResources = resources.filter((r) => r.url);

realResources.forEach((r) => {
  resourcesById[r.id] = r;
});

subjectsById[subjectId] = {
  id: subjectId,
  name,
  deptId: dept.id,
  year,
  sem,
  code,
  credits,
  teachers: finalTeachers,
  units,
  resourceIds: realResources.map((r) => r.id),
};
          byDeptYearSem[key].push(subjectId);
        });
      });
    }
  });

  return { subjectsById, resourcesById, byDeptYearSem };
}
const DATA = buildData();
const { subjectsById, resourcesById, byDeptYearSem } = DATA;

const totals = (() => {
  const subjCount = Object.keys(subjectsById).length;
  const resCount = Object.keys(resourcesById).length;
  return { subjCount, resCount };
})();

function deptTotals(deptId) {
  let s = 0, r = 0;
  Object.values(subjectsById).forEach((sub) => { if (sub.deptId === deptId) { s++; r += sub.resourceIds.length; } });
  return { s, r };
}
function deptById(id) { return DEPARTMENTS.find((d) => d.id === id); }
function accentBg(accent) { return { coral: "#FDE4E0", sky: "#E3F2FF", sun: "#FFF3D2", leaf: "#E1F5EC" }[accent] || "#fff"; }
function groupByUnit(list) {
  const g = {};
  list.forEach((r) => { const u = r.unit || "—"; (g[u] = g[u] || []).push(r); });
  return Object.fromEntries(Object.entries(g).sort((a, b) => Number(a[0]) - Number(b[0])));
}
function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ============================== ICONS (small hand-authored SVG set, lucide-esque) ============================== */
const ICONS = {
  search: '<path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="m21 21-4.3-4.3"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  x: '<path d="m6 6 12 12"/><path d="m18 6-12 12"/>',
  heart: '<path d="M12 20.5s-7.5-4.6-10-9.3C.4 8 2 4.5 5.4 4c2-.3 3.7.6 4.8 2.2.9-1.6 2.8-2.5 4.8-2.2C18.4 4.5 20 8 18.4 11.2 15.9 15.9 8.4 20.5 12 20.5Z"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  bookOpen: '<path d="M2 5c2.5-1.5 5-2 8-2v14c-3 0-5.5.5-8 2Z"/><path d="M22 5c-2.5-1.5-5-2-8-2v14c3 0 5.5.5 8 2Z"/>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  flask: '<path d="M9 2v6L3.5 18a2 2 0 0 0 1.8 3h13.4a2 2 0 0 0 1.8-3L15 8V2"/><path d="M8 2h8"/>',
  bookmark: '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/>',
  download: '<path d="M12 3v13"/><path d="m6 11 6 6 6-6"/><path d="M5 21h14"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m8.5 12.5 2.3 2.3L16 10"/>',
  upload: '<path d="M12 20V7"/><path d="m6 12 6-6 6 6"/><path d="M5 21h14"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  cap: '<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5"/>',
  mark: '<circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15"/><path d="M12 3.5a8.5 8.5 0 0 1 6 14.5" stroke="currentColor"/><path d="M12 20.5a8.5 8.5 0 0 1-6-14.5" stroke="currentColor"/><circle cx="12" cy="12" r="2.4" fill="currentColor"/>',
email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
github: '<path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.1-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.3-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.5-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .6 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/>',
linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7.5 10v7M7.5 7.2v.1"/><path d="M11.5 17v-4a2 2 0 0 1 4 0v4"/><path d="M11.5 17v-4.3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="10" y="10" width="4" height="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5 6.5 6.5M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2"/>',
  radio: '<circle cx="12" cy="12" r="2.5"/><path d="M8.5 8.5a5 5 0 0 0 0 7"/><path d="M15.5 15.5a5 5 0 0 0 0-7"/><path d="M5.5 5.5a9 9 0 0 0 0 13"/><path d="M18.5 18.5a9 9 0 0 0 0-13"/>',
  zap: '<path d="M13 2 4 14h6l-1 8 9-12h-6Z"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 6.2l2.1 2.1M17.7 15.7l2.1 2.1M2 12h3M19 12h3M4.2 17.8l2.1-2.1M17.7 8.3l2.1-2.1"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h1M8 11h1M8 15h1M15 7h1M15 11h1M15 15h1"/>',
  sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  activity: '<path d="M3 12h4l2 8 4-16 2 8h6"/>',
};
function icon(name, size = 16, extra = "") {
  return `<svg class="ic icon" width="${size}" height="${size}" viewBox="0 0 24 24" style="${extra}">${ICONS[name] || ""}</svg>`;
}

/* ============================== STATE ============================== */

const state = {
  page: "home",
  nav: { deptId: null, year: null, sem: null, subjectId: null, category: null, teacherId: null },
  unitFilter: "all",
  saved: new Set(),
  recent: [],
  activeResourceId: null,
  searchOpen: false,
  searchQuery: "",
  mobileMenuOpen: false,
  toast: null,
};
let toastTimer = null;
let uploadedFile = null; // holds the File object chosen in the upload form

function setState(patch) {
  Object.assign(state, patch);
  render();
}
function showToast(msg) {
  state.toast = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { state.toast = null; render(); }, 2400);
  render();
}

function goHome() { setState({ page: "home", nav: { deptId: null, year: null, sem: null, subjectId: null, category: null, teacherId: null }, mobileMenuOpen: false }); scrollTop(); }
function goBrowse() { setState({ page: "browse", nav: { deptId: null, year: null, sem: null, subjectId: null, category: null, teacherId: null }, mobileMenuOpen: false }); scrollTop(); }
function setPage(p) { setState({ page: p, mobileMenuOpen: false }); scrollTop(); }
function selectDept(deptId) { setState({ page: "browse", nav: { deptId, year: null, sem: null, subjectId: null, category: null, teacherId: null } }); scrollTop(); }
function selectYear(year) { state.nav = { ...state.nav, year, sem: null, subjectId: null, category: null, teacherId: null }; render(); scrollTop(); }
function selectSem(sem) { state.nav = { ...state.nav, sem, subjectId: null, category: null, teacherId: null }; render(); scrollTop(); }
function selectSubject(subjectId) { state.nav = { ...state.nav, subjectId, category: null, teacherId: null }; render(); scrollTop(); }
function selectCategory(category) { state.unitFilter = "all"; state.nav = { ...state.nav, category, teacherId: null }; render(); scrollTop(); }
function selectTeacher(teacherId) { state.nav = { ...state.nav, teacherId }; render(); scrollTop(); }
function backToLevel(level) {
  const n = state.nav;
  if (level === "depts") state.nav = { ...n, deptId: null, year: null, sem: null, subjectId: null, category: null, teacherId: null };
  if (level === "years") state.nav = { ...n, year: null, sem: null, subjectId: null, category: null, teacherId: null };
  if (level === "sems") state.nav = { ...n, sem: null, subjectId: null, category: null, teacherId: null };
  if (level === "subject") state.nav = { ...n, category: null, teacherId: null };
  if (level === "category") state.nav = { ...n, teacherId: null };
  render(); scrollTop();
}
function scrollTop() { window.scrollTo({ top: 0, behavior: "auto" }); }

function openResource(id) {
  state.activeResourceId = id;
  state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 6);
  render();
}
function toggleSave(id) {
  if (state.saved.has(id)) { state.saved.delete(id); showToast("Removed from saved"); }
  else { state.saved.add(id); showToast("Saved for later"); }
  render();
}

// ==== VIEW / DOWNLOAD / COPY LINK (NEW — these now do real things) ====
function viewResource(id) {
  const r = resourcesById[id];
  if (!r || !r.url) { showToast("This is a demo card — no real file attached yet"); return; }
  window.open(r.url, "_blank", "noopener");
}async function downloadResource(id) {
  const r = resourcesById[id];

  if (!r || !r.filePath) {
    showToast("No real file is attached yet");
    return;
  }

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .download(r.filePath);

  if (error) {
    showToast("Download failed: " + error.message);
    return;
  }

  const blobUrl = URL.createObjectURL(data);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = r.filePath.split("/").pop() || "study-material.pdf";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(blobUrl);
}
function copyResourceLink(id) {
  const r = resourcesById[id];
  if (!r || !r.url) { showToast("This is a demo card — no real file attached yet"); return; }
  navigator.clipboard.writeText(r.url)
    .then(() => showToast("Link copied to clipboard"))
    .catch(() => showToast("Couldn't copy link"));
}

function setUnitFilter(v) { state.unitFilter = v; render(); }

function quickCategory(cat) {
  state.page = "browse";
  state.nav = { deptId: "cse", year: 2, sem: 3, subjectId: "cse-y2-s3-1", category: cat, teacherId: null };
  state.unitFilter = "all";
  render(); scrollTop();
}

function searchResultsFor(q) {
  q = q.trim().toLowerCase();
  if (q.length < 2) return { subjects: [], resources: [], teachers: [] };
  const subjects = Object.values(subjectsById).filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)).slice(0, 6);
  const resources = Object.values(resourcesById).filter((r) => r.title.toLowerCase().includes(q) || r.subjectName.toLowerCase().includes(q)).slice(0, 8);
  const teacherSet = new Set();
  TEACHERS.forEach((t) => { if (t.toLowerCase().includes(q)) teacherSet.add(t); });
  return { subjects, resources, teachers: [...teacherSet] };
}

function goToSubjectFromSearch(id) {
  const s = subjectsById[id];
  state.searchOpen = false; state.searchQuery = "";
  state.nav = { deptId: s.deptId, year: s.year, sem: s.sem, subjectId: s.id, category: null, teacherId: null };
  state.page = "browse";
  render(); scrollTop();
}
function goToResourceFromSearch(id) {
  const r = resourcesById[id];
  const s = subjectsById[r.subjectId];
  state.searchOpen = false; state.searchQuery = "";
  state.nav = { deptId: s.deptId, year: s.year, sem: s.sem, subjectId: s.id, category: r.type, teacherId: null };
  state.page = "browse";
  openResource(id);
}

/* ============================== RENDER: HEADER ============================== */

function renderHeader() {
  const navItem = (label, page, active) => `<button data-nav-page="${page}" class="nav-link ${active ? "active" : ""}">${label}</button>`;
  return `
  <header class="site-header">
    <div class="wrap header-inner">
      <button class="brand" data-action="go-home">
<span class="brand-mark">${icon("mark", 18, "color:#fff")}</span>      <span class="font-display brand-name"> lumos </span>
      </button>
      <nav class="main-nav">
        <button data-action="go-home" class="nav-link ${state.page === "home" ? "active" : ""}">Home</button>
        <button data-action="go-browse" class="nav-link ${state.page === "browse" ? "active" : ""}">Courses</button>
        <button data-action="set-page" data-page="dashboard" class="nav-link ${state.page === "dashboard" ? "active" : ""}">Dashboard</button>
        <button data-action="set-page" data-page="upload" class="nav-link ${state.page === "upload" ? "active" : ""}">Contribute</button>
      </nav>
      <div class="header-actions">
        <button class="icon-btn" data-action="open-search" aria-label="Search">${icon("search", 17)}</button>
        <button class="icon-btn hide-sm" data-action="set-page" data-page="saved" aria-label="Saved">
          ${state.saved.size ? icon("heart", 17, "color:#F0523A; fill:#F0523A;") : icon("heart", 17)}
        </button>
        <button class="icon-btn sun hide-sm" data-action="set-page" data-page="dashboard" aria-label="Dashboard">${icon("user", 17)}</button>
        <button class="icon-btn show-mobile" data-action="toggle-mobile-menu">${state.mobileMenuOpen ? icon("x", 18) : icon("menu", 18)}</button>
      </div>
    </div>
    ${state.mobileMenuOpen ? `
    <div class="mobile-menu">
      <button data-action="go-home">Home</button>
      <button data-action="go-browse">Courses</button>
      <button data-action="set-page" data-page="saved">Saved</button>
      <button data-action="set-page" data-page="upload">Contribute</button>
    </div>` : ""}
  </header>`;
}

/* ============================== RENDER: SEARCH OVERLAY ============================== */

function renderSearchOverlay() {
  if (!state.searchOpen) return "";
  const q = state.searchQuery;
  const results = searchResultsFor(q);
  const hasAny = results.subjects.length || results.resources.length || results.teachers.length;
  return `
  <div class="overlay" data-action="close-search">
    <div class="search-panel">
      <div class="search-top">
        ${icon("search", 18)}
        <input id="search-input" data-action="search-input" value="${esc(q)}" placeholder="Search subjects, notes, teachers, course codes..." />
        <button class="icon-btn" style="width:32px;height:32px;border-width:2px;" data-action="close-search">${icon("x", 15)}</button>
      </div>
      <div class="search-results">
        ${q.trim().length < 2 ? `<p style="font-size:14px;color:var(--ink-99);text-align:center;padding:24px 8px;">Try "DBMS", "Unit 2", or a course code like CSE301.</p>` : ""}
        ${q.trim().length >= 2 && !hasAny ? renderEmptyState("No results found", "Try a different subject, teacher name or course code.") : ""}
        ${results.subjects.length ? `
        <div class="search-group">
          <p class="eyebrow" style="padding:0 8px;margin-bottom:4px;">Subjects</p>
          ${results.subjects.map((s) => `
          <button class="search-row" data-action="search-goto-subject" data-id="${esc(s.id)}">
            <span style="font-weight:700;font-size:14px;">${esc(s.name)} <span style="font-weight:600;color:var(--ink-80);">· ${esc(s.code)}</span></span>
            ${icon("chevronRight", 15)}
          </button>`).join("")}
        </div>` : ""}
        ${results.resources.length ? `
        <div class="search-group">
          <p class="eyebrow" style="padding:0 8px;margin-bottom:4px;">Resources</p>
          ${results.resources.map((r) => `
          <button class="search-row" data-action="search-goto-resource" data-id="${esc(r.id)}">
            <span style="font-size:14px;"><span style="font-weight:700;">${esc(r.title)}</span> <span style="color:var(--ink-80);">· ${esc(r.subjectName)}</span></span>
            ${icon("chevronRight", 15)}
          </button>`).join("")}
        </div>` : ""}
        ${results.teachers.length ? `
        <div>
          <p class="eyebrow" style="padding:0 8px;margin-bottom:4px;">Teachers</p>
          ${results.teachers.map((t) => `<div style="padding:8px;font-weight:700;font-size:14px;">${esc(t)}</div>`).join("")}
        </div>` : ""}
      </div>
    </div>
  </div>`;
}

/* ============================== RENDER: HOME PAGE ============================== */

function renderHomePage() {
  return `
  <section class="hero">
    <div class="blob blob-sun"></div>
    <div class="blob blob-sky"></div>
    <div class="wrap hero-inner">
      <div class="eyebrow">Built by students, for students</div>
      <div class="font-display hero-title">Study smarter.<br/>Find <span class="accent">everything</span> in one place.</div>
      <p class="hero-sub">Your notes, question papers, important questions and academic resources — organised by your course, semester and subject.</p>
      <div class="hero-actions">
        <button class="btn btn-primary btn-lg" data-action="go-browse">Explore Resources ${icon("arrowRight", 17)}</button>
      </div>
      <button class="hero-search" data-action="open-search">
        ${icon("search", 18, "color:var(--ink-99)")}
        <span>Search subjects, notes, teachers, course codes...</span>
      </button>
      <div class="hero-stats">
        <span>${totals.subjCount}+ subjects mapped</span>
        <span>${totals.resCount.toLocaleString()}+ resources</span>
        <span>7 departments</span>
      </div>
    </div>
  </section>

  <section class="section wrap">
    <div class="eyebrow">Choose your department</div>
    <h2 class="font-display">Pick your branch to get started</h2>
    <div class="grid dept-grid">
      ${DEPARTMENTS.map((d) => {
        const t = deptTotals(d.id);
        return `
        <button class="doodle-card dept-card" data-action="select-dept" data-dept="${d.id}">
          <div class="dept-icon" style="background:${accentBg(d.accent)}">${icon(d.icon, 20)}</div>
          <div class="font-display dept-title">${d.name}</div>
          <p class="dept-blurb">${d.blurb}</p>
          <div class="dept-foot"><span>${t.s} subjects · ${t.r} files</span>${icon("arrowRight", 15)}</div>
        </button>`;
      }).join("")}
    </div>
  </section>

  <section class="section wrap">
    <div class="eyebrow">Jump straight in</div>
    <h2 class="font-display">What are you looking for?</h2>
    <div class="grid quick-grid">
      ${[
        { key: "teacher-notes", label: "Notes", emoji: "📚", bg: "#FDE4E0" },
        { key: "pyq", label: "Question Papers", emoji: "📄", bg: "#E3F2FF" },
        { key: "important", label: "Important Questions", emoji: "⭐", bg: "#FFF3D2" },
        { key: "lab", label: "Lab Materials", emoji: "🧪", bg: "#E1F5EC" },
      ].map((q) => `
      <button class="doodle-card quick-card" style="background:${q.bg}" data-action="quick-category" data-category="${q.key}">
        <span class="quick-emoji">${q.emoji}</span>
        <span class="font-display">${q.label}</span>
      </button>`).join("")}
    </div>
  </section>

  <section class="section wrap">
    <div class="eyebrow">Three steps, zero clutter</div>
    <h2 class="font-display">Your Path to The Right Resources</h2>
    <div class="grid steps-grid">
      ${[
        { step: "1", title: "Pick your path", body: "Department → Year → Semester → Subject. Every level is one tap." },
        { step: "2", title: "Choose what you need", body: "Teacher notes, PYQs, Question banks, Labs manuals — sorted by category and unit." },
        { step: "3", title: "View or save it", body: "Open the PDF right in your browser, download it, or save for later." },
      ].map((s) => `
      <div class="step-card">
        <div class="font-display step-num">${s.step}</div>
        <div class="font-display step-title">${s.title}</div>
        <p class="step-body">${s.body}</p>
      </div>`).join("")}
    </div>
  </section>`;
}

/* ============================== BREADCRUMB ============================== */

function renderBreadcrumb(items) {
  return `<div class="breadcrumb">
    ${items.map((it, i) => `
      ${i > 0 ? `<span class="crumb-sep">·</span>` : ""}
      ${it.action ? `<button class="crumb" data-action="${it.action}" ${it.data ? Object.entries(it.data).map(([k,v])=>`data-${k}="${esc(v)}"`).join(" ") : ""}>${esc(it.label)}</button>` : `<span class="crumb current">${esc(it.label)}</span>`}
    `).join("")}
  </div>`;
}

/* ============================== BROWSE FLOW ============================== */

function renderBrowsePage() {
  const nav = state.nav;
  const dept = nav.deptId ? deptById(nav.deptId) : null;

  if (!nav.deptId) {
    return `
    <div class="wrap" style="padding:40px 0;">
      ${renderBreadcrumb([{ label: "All Departments" }])}
      <h1 class="font-display" style="font-size:30px;">Choose your department</h1>
      <p style="margin-top:8px;font-weight:600;color:var(--ink-99);">Everything is organised department → year → semester → subject.</p>
      <div class="grid dept-grid">
        ${DEPARTMENTS.map((d) => {
          const t = deptTotals(d.id);
          return `
          <button class="doodle-card dept-card" data-action="select-dept" data-dept="${d.id}">
            <div class="dept-icon" style="background:${accentBg(d.accent)}">${icon(d.icon, 20)}</div>
            <div class="font-display dept-title">${d.name}</div>
            <p class="dept-blurb">${d.full}</p>
            <div class="dept-foot"><span>${t.s} subjects · ${t.r} files</span>${icon("arrowRight", 15)}</div>
          </button>`;
        }).join("")}
      </div>
    </div>`;
  }

  if (!nav.year) {
    return `
    <div class="wrap" style="padding:40px 0;">
      ${renderBreadcrumb([{ label: "All Departments", action: "back-to-level", data: { level: "depts" } }, { label: dept.name }])}
      <h1 class="font-display" style="font-size:30px;">${esc(dept.full)}</h1>
      <p style="margin-top:8px;font-weight:600;color:var(--ink-99);">Explore everything from Semester 1 to Semester 8.</p>
      <div class="grid year-grid">
        ${["First Year", "Second Year", "Third Year", "Fourth Year"].map((label, i) => `
        <button class="doodle-card year-card" data-action="select-year" data-year="${i + 1}">
          <div class="font-display" style="font-size:18px;">${label}</div>
          <p style="font-size:12px;margin-top:4px;font-weight:800;color:var(--ink-80);">Semester ${i * 2 + 1} &amp; ${i * 2 + 2}</p>
        </button>`).join("")}
      </div>
    </div>`;
  }

  if (!nav.sem) {
    const semPair = nav.year === 1 ? [1, 2] : nav.year === 2 ? [3, 4] : nav.year === 3 ? [5, 6] : [7, 8];
    const yearLabel = ["First", "Second", "Third", "Fourth"][nav.year - 1] + " Year";
    return `
    <div class="wrap" style="padding:40px 0;">
      ${renderBreadcrumb([{ label: "All Departments", action: "back-to-level", data: { level: "depts" } }, { label: dept.name, action: "back-to-level", data: { level: "years" } }, { label: yearLabel }])}
      <h1 class="font-display" style="font-size:30px;">${yearLabel} · ${dept.name}</h1>
      <div class="grid sem-grid">
        ${semPair.map((s) => `
        <button class="doodle-card sem-card" data-action="select-sem" data-sem="${s}">
          <div class="font-display" style="font-size:24px;">Sem ${s}</div>
          <p style="font-size:12px;margin-top:4px;font-weight:800;color:var(--ink-80);">${(byDeptYearSem[`${dept.id}-${nav.year}-${s}`] || []).length} subjects</p>
        </button>`).join("")}
      </div>
    </div>`;
  }

  if (!nav.subjectId) {
    const yearLabel = ["First", "Second", "Third", "Fourth"][nav.year - 1] + " Year";
    const ids = byDeptYearSem[`${dept.id}-${nav.year}-${nav.sem}`] || [];
    return `
    <div class="wrap" style="padding:40px 0;">
      ${renderBreadcrumb([
        { label: "All Departments", action: "back-to-level", data: { level: "depts" } },
        { label: dept.name, action: "back-to-level", data: { level: "years" } },
        { label: yearLabel, action: "back-to-level", data: { level: "sems" } },
        { label: `Semester ${nav.sem}` },
      ])}
      <h1 class="font-display" style="font-size:30px;">${dept.name} · Semester ${nav.sem}</h1>
      <p style="margin-top:8px;font-weight:600;color:var(--ink-99);">${ids.length} subjects this semester</p>
      <div class="grid subject-grid">
        ${ids.map((sid) => {
          const s = subjectsById[sid];
          return `
          <button class="doodle-card subject-card" data-action="select-subject" data-subject="${sid}">
            <div class="subject-code-row">
              <span class="badge badge-sky">${esc(s.code)}</span>
              <span style="font-size:12px;font-weight:800;color:var(--ink-80);">${s.credits} cr</span>
            </div>
            <div class="font-display subject-name">${esc(s.name)}</div>
            <p class="subject-teachers">${esc(s.teachers.join(", "))}</p>
            <div class="subject-foot"><span>${s.resourceIds.length} resources</span>${icon("arrowRight", 15)}</div>
          </button>`;
        }).join("")}
      </div>
    </div>`;
  }

  const subject = subjectsById[nav.subjectId];
  const yearLabel = ["First", "Second", "Third", "Fourth"][nav.year - 1] + " Year";
  const crumbsBase = [
    { label: "All Departments", action: "back-to-level", data: { level: "depts" } },
    { label: dept.name, action: "back-to-level", data: { level: "years" } },
    { label: yearLabel, action: "back-to-level", data: { level: "sems" } },
    { label: `Sem ${nav.sem}`, action: "back-to-level", data: { level: "subject" } },
  ];

  if (!nav.category) {
    const resources = subject.resourceIds.map((id) => resourcesById[id]);
    return `
    <div class="wrap" style="padding:40px 0;">
      ${renderBreadcrumb([...crumbsBase, { label: subject.name }])}
      <div class="flex justify-between" style="flex-wrap:wrap;gap:16px;align-items:flex-start;">
        <div>
          <h1 class="font-display" style="font-size:30px;">${esc(subject.name)}</h1>
          <p style="margin-top:4px;font-weight:800;color:var(--ink-99);">${dept.name} · Year ${nav.year} · Semester ${nav.sem}</p>
        </div>
        <button class="btn btn-sky" data-action="select-category" data-category="teacher-notes">Start with notes ${icon("arrowRight", 15)}</button>
      </div>
      <div class="grid stat-grid">
        ${[{ label: "Code", value: subject.code }, { label: "Credits", value: subject.credits }, { label: "Faculty", value: subject.teachers.length }, { label: "Resources", value: resources.length }].map((s) => `
        <div class="stat-card"><div class="font-display stat-value">${esc(s.value)}</div><div class="stat-label">${s.label}</div></div>`).join("")}
      </div>
      <div class="eyebrow" style="margin-top:32px;">Everything for this subject</div>
      <div class="grid cat-grid" style="margin-top:12px;">
        ${CATEGORIES.map((c) => {
          const count = resources.filter((r) => r.type === c.key).length;
          return `
          <button class="doodle-card cat-card" ${count === 0 ? "disabled" : ""} style="${count ? "box-shadow:4px 4px 0 var(--ink);" : ""}" data-action="select-category" data-category="${c.key}">
            <span class="cat-emoji">${c.emoji}</span>
            <div style="flex:1;">
              <div class="font-display" style="font-size:15px;">${c.label}</div>
              <p class="cat-count">${count} ${count === 1 ? "file" : "files"}</p>
            </div>
            ${count > 0 ? icon("chevronRight", 16) : ""}
          </button>`;
        }).join("")}
      </div>
    </div>`;
  }
  if (nav.category === "teacher-notes" && nav.teacherId) {
    const files = subject.resourceIds.map((id) => resourcesById[id]).filter((r) => r.type === "teacher-notes" && r.teacher === nav.teacherId);
    const grouped = groupByUnit(files);
    return `
    <div class="wrap" style="padding:40px 0;">
      ${renderBreadcrumb([...crumbsBase, { label: subject.name, action: "back-to-level", data: { level: "category" } }, { label: " Notes", action: "select-teacher-null" }, { label: nav.teacherId }])}
      <div class="flex items-center" style="gap:12px;">
        <div class="teacher-avatar" style="width:56px;height:56px;font-size:24px;">👩‍🏫</div>
        <div>
          <h1 class="font-display" style="font-size:26px;">${esc(nav.teacherId)}</h1>
          <p style="font-size:14px;font-weight:800;color:var(--ink-99);">${dept.full} · ${esc(subject.name)} · <span class="badge badge-leaf">${icon("check", 11)} Faculty Verified</span></p>
        </div>
      </div>
      <p style="margin-top:16px;font-weight:800;font-size:14px;color:var(--ink-80);">${files.length} resources uploaded</p>
      <div style="margin-top:24px;">
        ${Object.entries(grouped).map(([unit, list]) => `
        <div class="unit-group">
          <h3 class="font-display">Unit ${unit}</h3>
          <div class="grid resource-grid">${list.map((r) => renderResourceCard(r)).join("")}</div>
        </div>`).join("")}
      </div>
    </div>`;
  }

  // generic category resource list
  const cat = CAT_BY_KEY[nav.category];
  const all = subject.resourceIds.map((id) => resourcesById[id]).filter((r) => r.type === nav.category);
  const unitsPresent = [...new Set(all.map((r) => r.unit).filter(Boolean))].sort((a, b) => a - b);
  const filtered = state.unitFilter === "all" ? all : all.filter((r) => r.unit === Number(state.unitFilter));

  return `
  <div class="wrap" style="padding:40px 0;">
    ${renderBreadcrumb([...crumbsBase, { label: subject.name, action: "back-to-level", data: { level: "category" } }, { label: cat.label }])}
    <h1 class="font-display" style="font-size:30px;">${cat.emoji} ${cat.label}</h1>
    <p style="margin-top:8px;font-weight:600;color:var(--ink-99);">${cat.desc} · ${esc(subject.name)}</p>
    ${unitsPresent.length ? `
    <div class="unit-chips no-scrollbar">
      <button class="unit-chip ${state.unitFilter === "all" ? "active" : ""}" data-action="set-unit-filter" data-unit="all">All</button>
      ${unitsPresent.map((u) => `<button class="unit-chip ${state.unitFilter === String(u) ? "active" : ""}" data-action="set-unit-filter" data-unit="${u}">Unit ${u}</button>`).join("")}
    </div>` : ""}
    ${filtered.length === 0 ? `<div style="margin-top:20px;">${renderEmptyState("No resources here yet", "Be the first to contribute for this subject.", "Upload Notes", "goto-upload")}</div>` :
      `<div class="grid resource-grid">${filtered.map((r) => renderResourceCard(r)).join("")}</div>`}
  </div>`;
}

/* ============================== RESOURCE CARD ============================== */

function renderResourceCard(r) {
  const isSaved = state.saved.has(r.id);
  return `
  <div class="doodle-card resource-card">
    <div class="res-top">
      <span class="tags">
        <span class="badge badge-ink">PDF</span>
        ${r.verified ? `<span class="badge badge-leaf">${icon("check", 11)} Verified</span>` : ""}
        ${!r.url ? `<span class="badge">Demo</span>` : ""}
      </span>
      <button class="heart-btn" data-action="toggle-save" data-id="${esc(r.id)}" aria-label="Save">
        ${isSaved ? icon("heart", 13, "color:#F0523A;fill:#F0523A;") : icon("heart", 13)}
      </button>
    </div>
    <div class="font-display res-title">${esc(r.title)}</div>
    <div class="res-meta">${esc(r.subjectName)}${r.unit ? ` · Unit ${r.unit}` : ""}</div>
    <div class="res-meta">By ${esc(r.teacher)}</div>
    <div class="res-meta2">${r.size ? r.size + " MB · " : ""}Added ${r.date}</div>
    <div class="res-actions">
      <button class="btn btn-secondary btn-sm" data-action="open-resource" data-id="${esc(r.id)}">${icon("eye", 13)} View</button>
      <button class="btn btn-primary btn-sm" data-action="download-resource" data-id="${esc(r.id)}">${icon("download", 13)} Download</button>
    </div>
  </div>`;
}

/* ============================== RESOURCE MODAL ============================== */

function renderResourceModal() {
  if (!state.activeResourceId) return "";
  const resource = resourcesById[state.activeResourceId];
  const subject = subjectsById[resource.subjectId];
  const cat = CAT_BY_KEY[resource.type];
  const related = subject.resourceIds.map((id) => resourcesById[id])
    .filter((r) => r.id !== resource.id && (r.type === resource.type || r.unit === resource.unit)).slice(0, 3);
  const isSaved = state.saved.has(resource.id);

  return `
  <div class="modal-overlay" data-action="close-modal">
    <div class="modal-panel">
      <div class="modal-head">
        <div class="modal-head-top">
          <div class="modal-tags">
            <span class="badge badge-ink">PDF</span>
            ${resource.verified ? `<span class="badge badge-leaf">${icon("check", 11)} Faculty Verified</span>` : ""}
            <span class="badge badge-sun">${cat.emoji} ${cat.label}</span>
          </div>
          <button class="icon-btn" style="width:32px;height:32px;border-width:2px;flex-shrink:0;" data-action="close-modal">${icon("x", 15)}</button>
        </div>
        <h2 class="font-display modal-title">${esc(resource.title)}</h2>
        <p class="modal-sub">${esc(subject.name)} ${resource.unit ? `· Unit ${resource.unit}` : ""}</p>
      </div>
      <div class="modal-body">
        <div class="info-grid">
          ${infoBlock("Department", subject.deptId.toUpperCase())}
          ${infoBlock("Semester", `Sem ${subject.sem}`)}
          ${infoBlock("Contributor", resource.teacher)}
          ${infoBlock("Uploaded", resource.date)}
          ${infoBlock("File size", resource.size ? `${resource.size} MB` : "—")}
          ${infoBlock("Downloads", resource.downloads)}
        </div>
        <p class="modal-desc">${cat.desc}. Reviewed for accuracy before publishing so you can revise with confidence.</p>
       ${resource.url ? `
  <iframe
    class="pdf-preview"
    src="${esc(resource.url)}"
    title="${esc(resource.title)}">
  </iframe>
` : `
  <div class="preview-box">
    ${icon("fileText", 28, "color:var(--ink-66)")}
    <span>No PDF is attached to this resource yet.</span>
  </div>
`}
        <div class="modal-actions">
          <button class="btn btn-primary" data-action="view-resource" data-id="${esc(resource.id)}">${icon("eye", 15)} Open PDF</button>
          <button class="btn btn-secondary" data-action="download-resource" data-id="${esc(resource.id)}">${icon("download", 15)} Download</button>
          <button class="btn btn-secondary" data-action="copy-link" data-id="${esc(resource.id)}">${icon("clipboard", 15)} Copy Link</button>
          <button class="save-toggle ${isSaved ? "active" : ""}" data-action="toggle-save" data-id="${esc(resource.id)}">
            ${isSaved ? icon("heart", 16, "color:#F0523A;fill:#F0523A;") : icon("heart", 16)}
          </button>
        </div>
        ${related.length ? `
        <div style="padding-top:12px;">
          <p class="eyebrow" style="margin-bottom:8px;">Related Resources</p>
          <div class="related-list">
            ${related.map((r) => `
            <button class="related-row" data-action="open-resource" data-id="${esc(r.id)}">
              <span>${esc(r.title)}</span>${icon("chevronRight", 14)}
            </button>`).join("")}
          </div>
        </div>` : ""}
      </div>
    </div>
  </div>`;
}
function infoBlock(label, value) {
  return `<div><div class="info-label">${label}</div><div class="info-value">${esc(value)}</div></div>`;
}

/* ============================== UPLOAD PAGE ============================== */

let uploadSubmitted = false;

function renderUploadPage() {
  const resourceTypes = [" Notes", "Handwritten Notes", "PYQ", "Important Questions", "Assignment", "Lab Material", "Reference Material"];

  if (uploadSubmitted) {
    return `
    <div class="upload-success">
      <div class="success-icon">${icon("check", 28, "color:#1E8A5C")}</div>
      <h1 class="font-display">Thanks for contributing!</h1>
      <p>Your upload is queued for review. It'll go live once a moderator checks it.</p>
      <div class="success-actions">
        <button class="btn btn-primary" data-action="upload-another">Upload another</button>
        <button class="btn btn-secondary" data-action="set-page" data-page="dashboard">Go to dashboard</button>
      </div>
    </div>`;
  }

  return `
  <div class="upload-wrap">
    <div class="eyebrow">Give back to your batch</div>
    <h1 class="font-display upload-title">Share your notes.</h1>
    <p style="margin-top:8px;font-weight:600;color:var(--ink-99);">Help the next student find what you couldn't.</p>
    <form class="upload-form" data-action="submit-upload">
      <div class="form-grid">
        ${fieldHTML("Contributor name", "text", "Your name", true)}
        ${selectHTML("Department", DEPARTMENTS.map((d) => d.name))}
        ${selectHTML("Year", ["First Year", "Second Year", "Third Year", "Fourth Year"])}
        ${selectHTML("Semester", ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"])}
        ${fieldHTML("Subject", "text", "e.g. Database Management Systems")}
        ${fieldHTML("Teacher", "text", "e.g. Dr. Priya Sharma")}
        ${selectHTML("Unit", ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"])}
        ${selectHTML("Resource type", resourceTypes)}
      </div>
      <div class="field">
        <label>Title</label>
        <input type="text" placeholder="e.g. Unit 3 Normalization Notes" required />
      </div>
      <div class="field">
        <label>Description</label>
        <textarea rows="3" placeholder="What's covered in this file?"></textarea>
      </div>
      <div class="field">
        <label>Upload PDF</label>
        <!-- FIX: the real <input type="file"> and the ids the JS listens on
             ("dropzone" / "pdf-input" / "dropzone-text") were missing from
             the markup before, so choosing/dropping a file never did anything. -->
        <div class="dropzone" id="dropzone">
          <input type="file" id="pdf-input" accept="application/pdf" style="display:none" />
          ${icon("upload", 20, "color:var(--ink-80)")}
          <span id="dropzone-text">Drag a PDF here, or tap to choose a file</span>
        </div>
      </div>
      <p class="form-note">All uploaded resources are reviewed before being published.</p>
      <button type="submit" class="btn btn-primary btn-lg btn-full">Submit for review ${icon("arrowRight", 16)}</button>
    </form>
  </div>`;
}
function fieldHTML(label, type, placeholder, required) {
  return `<div class="field"><label>${label}</label><input type="${type}" placeholder="${esc(placeholder)}" ${required ? "required" : ""} /></div>`;
}
function selectHTML(label, options) {
  return `<div class="field"><label>${label}</label><select>${options.map((o) => `<option>${esc(o)}</option>`).join("")}</select></div>`;
}

/* ============================== DASHBOARD / SAVED ============================== */

function renderDashboardPage() {
  const savedList = [...state.saved].map((id) => resourcesById[id]).filter(Boolean);
  const recentList = state.recent.map((id) => resourcesById[id]).filter(Boolean);
  return `
  <div class="wrap" style="padding:40px 0;">
    <h1 class="font-display dash-title">Welcome back 👋</h1>
    <p class="dash-sub">B.E. CSE · Semester 3</p>
    <div class="grid dash-grid">
      <button class="doodle-card dash-card" style="background:#FDE4E0;" data-action="go-browse">
        ${icon("bookOpen", 20)}
        <div class="font-display dash-card-title">Continue Studying</div>
        <p class="dash-card-sub">Jump back into your subjects</p>
      </button>
      <button class="doodle-card dash-card" style="background:#FFF3D2;" data-action="set-page" data-page="saved">
        ${icon("heart", 20)}
        <div class="font-display dash-card-title">Saved Notes</div>
        <p class="dash-card-sub">${savedList.length} resources saved</p>
      </button>
      <button class="doodle-card dash-card" style="background:#E1F5EC;" data-action="set-page" data-page="upload">
        ${icon("upload", 20)}
        <div class="font-display dash-card-title">Uploaded Notes</div>
        <p class="dash-card-sub">Share something new</p>
      </button>
    </div>
    <div style="margin-top:40px;">
      <div class="section-head">${icon("clock", 16)}<h2 class="font-display">Recently viewed</h2></div>
      ${recentList.length === 0 ? renderEmptyState("Nothing viewed yet", "Open a resource and it'll show up here.") :
        `<div class="grid resource-grid">${recentList.map((r) => renderResourceCard(r)).join("")}</div>`}
    </div>
  </div>`;
}

function renderSavedPage() {
  const list = [...state.saved].map((id) => resourcesById[id]).filter(Boolean);
  return `
  <div class="wrap" style="padding:40px 0;">
    <h1 class="font-display dash-title">Saved Resources</h1>
    <p class="dash-sub">${list.length} saved</p>
    ${list.length === 0 ? `<div style="margin-top:24px;">${renderEmptyState("No saved notes yet", "Tap the heart on any resource to save it for later.", "Browse subjects", "go-browse")}</div>` :
      `<div class="grid resource-grid" style="margin-top:24px;">${list.map((r) => renderResourceCard(r)).join("")}</div>`}
  </div>`;
}

/* ============================== SHARED BITS ============================== */

function renderEmptyState(title, body, actionLabel, actionKey) {
  return `
  <div class="empty-state">
    <div class="empty-emoji">🗒️</div>
    <div class="font-display empty-title">${title}</div>
    <p class="empty-body">${body}</p>
    ${actionLabel ? `<div class="empty-action"><button class="btn btn-primary" data-action="${actionKey}">${actionLabel}</button></div>` : ""}
  </div>`;
}

function renderToast() {
  if (!state.toast) return "";
  return `<div class="toast">${esc(state.toast)}</div>`;
}

function renderFooter() {
  return `
  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div class="footer-brand">
        <div class="flex items-center" style="gap:8px;">
        <span class="brand-mark">${icon("mark", 17, "color:#fff")}</span>
         
          <span class="font-display" style="font-size:18px;">lumos</span>
        </div>
        <p>Everything you need. One organised place.<br><br>Built for Us the Students to Access the Resources to Our Academic(;<br> <br>
          The Scattered Resources In Google classroom,Whatsapp,Drive,etc.. Is Now At One Place <br> <br>All You Need To do is Log in To access the Resources/Pdf<br><br> </p><h3>There is No Right <i>"Time"</i>To Start.. Get Started Now !! </h3>
      </div>
      <div class="footer-col">
        <span class="eyebrow">Explore</span>
        <div class="footer-links">
          <button data-action="go-home">Home</button>
          <button data-action="go-browse">Courses</button>
          <button data-action="set-page" data-page="browse">Notes</button>
          <button data-action="set-page" data-page="upload">Contribute</button>
        </div>
      </div>
      <div class="footer-col">
        <span class="eyebrow">About</span>
        <span>

Study Nest started as a second-year mini project.
<br>
the original plan was pretty simple —<br><br>

somewhere along the way, I started caring about the little things.
the layout, the tiny details, the way everything feels
when you actually use it.<br><br>

so yeah, this is what came out of it.<br><br>
still a work in progress.<br>
but then again, most good things are.</span>
        <div class="footer-about">
          <span> </span>
<span class="eyebrow">Connect</span>
          <span>Have any Issues Or Want to appreciate Us..😉Feel Free to shoot us a Mail or Msg using Our Socials </span>

<span>Give a Star⭐ If You Like In Github</span>
        <div class="footer-social">
          <a class="social-btn" href="mailto:poojajohnsonmenaka@gmail.com" aria-label="Email">${icon("email", 17)}</a>
          <a class="social-btn" href="https://github.com/percyjacksonn/" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${icon("github", 17)}</a>
          <a class="social-btn" href="https://www.linkedin.com/in/pooja-johnson-/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">${icon("linkedin", 17)}</a>
        </div>
      </div>
    </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">©Copyright lumos· A study-material sharing platform created by Pooja and the team As our 2nd yr Mini Project </div>
  </footer>`;
}

/* ============================== ROOT RENDER ============================== */

function render() {
  let pageHTML = "";
  if (state.page === "home") pageHTML = renderHomePage();
  else if (state.page === "browse") pageHTML = renderBrowsePage();
  else if (state.page === "upload") pageHTML = renderUploadPage();
  else if (state.page === "dashboard") pageHTML = renderDashboardPage();
  else if (state.page === "saved") pageHTML = renderSavedPage();

  const html = `
    ${renderHeader()}
    ${renderSearchOverlay()}
    <main>${pageHTML}</main>
    ${renderFooter()}
    ${renderResourceModal()}
    ${renderToast()}
  `;
  const app = document.getElementById("app");
  app.innerHTML = html;

  // restore focus to search input if the overlay is open (innerHTML replace loses focus)
  if (state.searchOpen) {
    const input = document.getElementById("search-input");
    if (input) {
      input.focus();
      const val = input.value;
      input.value = "";
      input.value = val;
    }
  }
}

/* ============================== EVENT DELEGATION ============================== */

document.addEventListener("click", (e) => {
  // Click-to-browse on the upload dropzone (NEW — opens the real file picker)
  const zone = e.target.closest("#dropzone");
  if (zone) { document.getElementById("pdf-input").click(); return; }

  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.getAttribute("data-action");
  switch (action) {
    case "go-home": goHome(); break;
    case "go-browse": goBrowse(); break;
    case "set-page": setPage(el.getAttribute("data-page")); break;
    case "select-dept": selectDept(el.getAttribute("data-dept")); break;
    case "select-year": selectYear(Number(el.getAttribute("data-year"))); break;
    case "select-sem": selectSem(Number(el.getAttribute("data-sem"))); break;
    case "select-subject": selectSubject(el.getAttribute("data-subject")); break;
    case "select-category": selectCategory(el.getAttribute("data-category")); break;
    case "select-teacher": selectTeacher(el.getAttribute("data-teacher")); break;
    case "select-teacher-null": selectTeacher(null); break;
    case "back-to-level": backToLevel(el.getAttribute("data-level")); break;
    case "open-resource": openResource(el.getAttribute("data-id")); break;
    case "toggle-save": toggleSave(el.getAttribute("data-id")); break;
    // ==== CHANGED: these now open/download/copy the REAL file (see functions above) ====
    case "view-resource": viewResource(el.getAttribute("data-id")); break;
    case "download-resource": downloadResource(el.getAttribute("data-id")); break;
    case "copy-link": copyResourceLink(el.getAttribute("data-id")); break;
    case "set-unit-filter": setUnitFilter(el.getAttribute("data-unit")); break;
    case "quick-category": quickCategory(el.getAttribute("data-category")); break;
    case "open-search": setState({ searchOpen: true }); break;
    case "close-search": {
      const isBackdrop = el.classList.contains('overlay');
      if (isBackdrop && e.target !== el) break;
      setState({ searchOpen: false, searchQuery: "" });
      break;
    }    case "close-modal": {
  const isBackdrop = el.classList.contains('modal-overlay');
  if (isBackdrop && e.target !== el) break; // click landed inside the panel content, not the dark backdrop — ignore it
  setState({ activeResourceId: null });
  break;
}
    case "toggle-mobile-menu": setState({ mobileMenuOpen: !state.mobileMenuOpen }); break;
    case "search-goto-subject": goToSubjectFromSearch(el.getAttribute("data-id")); break;
    case "search-goto-resource": goToResourceFromSearch(el.getAttribute("data-id")); break;
    case "goto-upload": setPage("upload"); break;
    case "upload-another": uploadSubmitted = false; uploadedFile = null; render(); break;
    default: break;
  }
});

document.addEventListener("input", (e) => {
  if (e.target && e.target.id === "search-input") {
    state.searchQuery = e.target.value;
    render();
  }
});

document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "pdf-input") {
    const file = e.target.files[0];
    const text = document.getElementById("dropzone-text");
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast("Please choose a PDF file");
      e.target.value = "";
      return;
    }
    uploadedFile = file;
    if (text) text.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  }
});

// drag-and-drop support
document.addEventListener("dragover", (e) => {
  if (e.target.closest("#dropzone")) e.preventDefault();
});
document.addEventListener("drop", (e) => {
  const zone = e.target.closest("#dropzone");
  if (!zone) return;
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && file.type === "application/pdf") {
    uploadedFile = file;
    document.getElementById("pdf-input").files = e.dataTransfer.files;
    document.getElementById("dropzone-text").textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  } else {
    showToast("Please drop a PDF file");
  }
});

// ==== CHANGED: submit handler now actually uploads the file to Supabase Storage ====
document.addEventListener("submit", async (e) => {
  const form = e.target.closest('[data-action="submit-upload"]');
  if (!form) return;
  e.preventDefault();

  if (!uploadedFile) {
    showToast("Please choose a PDF file first");
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalLabel = submitBtn ? submitBtn.innerHTML : "";
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Uploading..."; }

  // Build a unique, safe path inside the bucket.
  // Everything goes in an "uploads/" folder for now so it's easy to find
  // and move into REAL_RESOURCES once you've reviewed it.
  const cleanName = uploadedFile.name.replace(/\s+/g, "_");
  const filePath = `uploads/${Date.now()}_${cleanName}`;

  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(filePath, uploadedFile);

  if (uploadError) {
    showToast("Upload failed: " + uploadError.message);
    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalLabel; }
    return;
  }

  // ==== OPTIONAL: SAVE METADATA TO A DATABASE TABLE ====
  // Right now the file lands in Storage but nothing records who uploaded it,
  // for which subject, etc. To track that, create a table once in the
  // Supabase SQL editor:
  //
  //   create table files (
  //     id uuid primary key default gen_random_uuid(),
  //     file_name text not null,
  //     file_path text not null,
  //     file_url text not null,
  //     department text, year text, semester text,
  //     subject text, teacher text, unit text, resource_type text,
  //     title text, description text,
  //     uploaded_by text,
  //     status text default 'pending', -- for moderation
  //     created_at timestamp default now()
  //   );
  //
  // Then uncomment this block to save the form's details alongside the file:
  //
  // const inputs = form.querySelectorAll("input[type=text], select, textarea");
  // const [contributor, subjectField, teacherField] = form.querySelectorAll('input[type="text"]');
  // await supabase.from("files").insert([{
  //   file_name: cleanName,
  //   file_path: filePath,
  //   file_url: getPublicFileUrl(filePath),
  //   uploaded_by: contributor ? contributor.value : null,
  //   status: "pending",
  // }]);

  uploadedFile = null;
  uploadSubmitted = true;
  showToast("Upload received — thank you!");
  render();
});

/* ============================== INIT ============================== */
render();