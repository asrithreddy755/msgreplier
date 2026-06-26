export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string; // initials for avatar placeholder
}

export const authors: Record<string, Author> = {
  priya: {
    id: "priya",
    name: "Priya Sharma",
    role: "Relationship Writer",
    bio: "Priya is a relationship coach and digital wellness writer with over five years of experience helping couples navigate modern love. She specialises in long-distance relationships, digital communication, and emotional intimacy.",
    avatar: "PS",
  },
  arjun: {
    id: "arjun",
    name: "Arjun Mehta",
    role: "Tech & Culture Writer",
    bio: "Arjun writes about the intersection of technology, culture, and relationships. With a background in psychology and UX design, he explores how digital tools shape the way we connect and communicate with the people we love.",
    avatar: "AM",
  },
};

export type AuthorId = keyof typeof authors;
