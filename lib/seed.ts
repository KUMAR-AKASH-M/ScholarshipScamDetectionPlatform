import {
  analyzeScholarship,
  type DetectionResult,
  type ScholarshipInput,
} from "./detector";

export interface SeedScholarship extends ScholarshipInput {
  id: string;
  amount: string;
  deadline: string;
  isSampleData: true;
  detection: DetectionResult;
}

interface RawSeedItem extends ScholarshipInput {
  id: string;
  amount: string;
  deadline: string;
}

const RAW_SEED_SCHOLARSHIPS: RawSeedItem[] = [
  {
    id: "nsp-post-matric-minorities",
    name: "Post-Matric Scholarship for Minorities (NSP)",
    url: "https://scholarships.gov.in/public/schemeGuidelines",
    organisation: "Ministry of Minority Affairs, Government of India",
    contactEmail: "helpdesk@scholarships.gov.in",
    amount: "Up to ₹10,000 / year + tuition",
    deadline: "October 31 (Annual Cycle)",
    description:
      "Financial assistance for students belonging to minority communities studying in Class 11 through PhD at recognized institutions. Applicants must have secured at least 50% marks in the previous final examination and have annual family income below ₹2.00 lakh. Applications are submitted solely through the National Scholarship Portal with zero application or processing fee.",
  },
  {
    id: "hdfc-parivartan-ecss",
    name: "HDFC Bank Parivartan's ECSS Programme",
    url: "https://www.buddy4study.com/page/hdfc-bank-parivartans-ecss-programme",
    organisation: "HDFC Bank & Buddy4Study Foundation",
    contactEmail: "ecss@buddy4study.com",
    amount: "₹15,000 – ₹75,000",
    deadline: "September 30 (Annual Cycle)",
    description:
      "Merit-cum-means scholarship supporting school, diploma, undergraduate, and postgraduate students facing personal or family financial crisis. Eligibility requires minimum 55% marks in the previous qualifying exam and annual family income under ₹2.5 lakh. Selection includes document verification and telephonic interview, with no registration fee charged at any stage.",
  },
  {
    id: "chevening-india-masters",
    name: "Chevening India Master's Scholarship",
    url: "https://www.chevening.org/scholarship/india/",
    organisation: "UK Foreign, Commonwealth & Development Office",
    contactEmail: "info@chevening.org",
    amount: "Full UK university tuition + monthly stipend",
    deadline: "November 5 (Annual Cycle)",
    description:
      "Fully funded scholarship for emerging leaders from India to pursue a one-year taught master's degree at any accredited UK university. Applicants require an undergraduate degree, at least two years of work experience, and a return-home commitment. There is no application fee to apply through the official Chevening online portal.",
  },
  {
    id: "national-merit-excellence-grant",
    name: "National Merit Excellence Grant 2026",
    url: "https://national-merit-grant.sites.google.com/view/apply",
    organisation: "National Merit Education Council",
    contactEmail: "nationalmeritgrant2026@gmail.com",
    amount: "₹30,000 (One-time)",
    deadline: "Closes This Week",
    description:
      "Open to undergraduate and diploma students across India seeking tuition assistance for the 2026 academic session based on academic merit. Last chance to apply before the online form closes; submit scanned marksheets to our coordinator email.",
  },
  {
    id: "global-youth-stem-aid",
    name: "Global Youth STEM Tuition Aid",
    url: "http://global-stem-aid.online/apply",
    organisation: "Global Youth Education Initiative",
    contactEmail: "apply@youthaid-desk.org",
    amount: "$1,500 Tuition Grant",
    deadline: "Rolling Review",
    description:
      "Provides partial tuition fellowships for undergraduate STEM students demonstrating academic merit and documented financial need. Applicants must upload official transcripts, enrollment verification, and household income statements for committee review.",
  },
  {
    id: "state-laptop-stipend-scheme",
    name: "State Higher Education Laptop & Stipend Drive",
    url: "https://state-student-portal.wordpress.com/2026-scheme",
    organisation: "State Student Welfare Initiative",
    amount: "Free Laptop + ₹12,000 Stipend",
    deadline: "Urgent Notice",
    description:
      "Apply for the state higher education laptop and student stipend distribution drive for college enrollees. Spots filling fast — complete your student ID verification and academic details on the portal before the deadline.",
  },
  {
    id: "pm-free-laptop-scholarship-scam",
    name: "PM National Free Laptop & ₹25,000 Scholarship",
    url: "http://scholarships-gov-in.xyz/claim-now",
    organisation: "Scholarship Admin Team",
    amount: "₹25,000 + Free Laptop",
    deadline: "Within 24 Hours",
    description:
      "Congratulations! You have been shortlisted for the ₹25,000 national scholarship and free laptop yojana. Guaranteed selection for every student! Apply in 24 hours. Pay a refundable registration fee of ₹499 via UPI or GPay and message WhatsApp +91 9876543210 to claim.",
  },
  {
    id: "buddy4study-instant-cash-scam",
    name: "Buddy4Study Instant Cash Award 2026",
    url: "https://buddy4study-claim.wixsite.com/portal",
    organisation: "Reward Desk",
    contactEmail: "buddy4study.claims@gmail.com",
    amount: "₹15,000 Instant Cash",
    deadline: "Today Only",
    description:
      "Dear student, you have been shortlisted for the Buddy4Study Instant Cash Award 2026. To release your scholarship money today, pay a processing fee of Rs. 999 and share your bank account number and IFSC code immediately.",
  },
  {
    id: "isp-bursary-relief-scam",
    name: "International Student Relief Bursary",
    url: "http://isp-bursary-aid.top/verify",
    organisation: "Admin",
    amount: "$2,000 Relief Bursary",
    deadline: "Expires Tonight",
    description:
      "100% scholarship for everyone with no eligibility required! Pay a security deposit via Paytm to @bursary_verify_bot on Telegram before tonight to lock your guaranteed approval.",
  },
];

export const SEED_SCHOLARSHIPS: SeedScholarship[] = RAW_SEED_SCHOLARSHIPS.map(
  (item) => ({
    ...item,
    isSampleData: true,
    detection: analyzeScholarship(item),
  })
);

export function getSeedScholarshipById(id: string): SeedScholarship | undefined {
  return SEED_SCHOLARSHIPS.find((item) => item.id === id);
}

