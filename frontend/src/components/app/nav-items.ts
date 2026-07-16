import { BookOpen, Bookmark, LayoutDashboard, MessageCircle, Mic, Sparkles } from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/lessons", label: "Lessons", icon: BookOpen },
  { href: "/practice/speak", label: "Speak", icon: Mic },
  { href: "/practice/quiz", label: "Quiz", icon: Sparkles },
  { href: "/tutor", label: "AI Tutor", icon: MessageCircle },
  { href: "/words", label: "Words", icon: Bookmark },
] as const;
