export interface Author {
  id: string;
  name: string;
  role: string;
  credentials: string;
  bio: string;
  avatar: string; // initials for avatar placeholder
}

export const authors: Record<string, Author> = {
  priya: {
    id: "priya",
    name: "Priya Sharma",
    role: "Licensed Relationship Counselor & Digital Wellness Expert",
    credentials: "M.S. in Clinical Psychology, Certified Relationship Coach (ICF)",
    bio: "Priya is a licensed relationship counselor and digital wellness writer with over eight years of experience helping couples navigate modern intimacy. She holds a Master's degree in Clinical Psychology and is a Certified Relationship Coach specializing in long-distance connections, digital boundary-setting, and emotional attachment styles.",
    avatar: "PS",
  },
  arjun: {
    id: "arjun",
    name: "Arjun Mehta",
    role: "Relationship Psychologist & Digital Communication Expert",
    credentials: "M.A. in Social Psychology, Tech Ethicist",
    bio: "Arjun writes about the intersection of technology, cognitive psychology, and interpersonal relationships. Holding a Master's degree in Social Psychology, he has spent over six years researching how digital communication interfaces, texting habits, and interactive couple games influence romantic bonding and attachment patterns.",
    avatar: "AM",
  },
};

export type AuthorId = keyof typeof authors;
