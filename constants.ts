
import { College, Student } from './types';

export const INITIAL_COLLEGES: College[] = [
  {
    id: '1',
    name: "Chaitanya Academy",
    location: "Hyderabad",
    fees: "₹1,50,000",
    phone: "9876543210",
    hostel: true,
    rating: 4.8,
    students: [
      { id: "240100123", name: "Rahul Sharma", score: "99.85%tile", type: "JEE Mains" },
      { id: "ADV24001", name: "Anish Kumar", score: "AIR 450", type: "JEE Advanced" }
    ]
  },
  {
    id: '2',
    name: "Vision Institute",
    location: "Kota",
    fees: "₹2,10,000",
    phone: "9898989898",
    hostel: true,
    rating: 4.9,
    students: [
      { id: "240100456", name: "Priya Singh", score: "99.92%tile", type: "JEE Mains" },
      { id: "NEET2405", name: "Sneha Reddy", score: "99.78%tile", type: "NEET" }
    ]
  },
  {
    id: '3',
    name: "Akashic Career Point",
    location: "Hyderabad",
    fees: "₹1,20,000",
    phone: "9123456780",
    hostel: false,
    rating: 4.5,
    students: [
      { id: "240100789", name: "Vikram Batra", score: "98.90%tile", type: "JEE Mains" }
    ]
  }
];

export const NTA_MOCK_DATABASE: Record<string, any> = {
  "240100123": { name: "Rahul Sharma", percentile: 99.85, rank: 1450, exam: "JEE Mains" },
  "240100456": { name: "Priya Singh", percentile: 99.92, rank: 820, exam: "JEE Mains" },
  "ADV24001": { name: "Anish Kumar", percentile: 0, rank: 450, exam: "JEE Advanced" },
  "NEET2405": { name: "Sneha Reddy", percentile: 99.78, rank: 2100, exam: "NEET" },
  "NEET2409": { name: "Mohit Jain", percentile: 99.99, rank: 12, exam: "NEET" },
  "240999999": { name: "Test Student", percentile: 95.00, rank: 50000, exam: "JEE Mains" },
};
