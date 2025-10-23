// sample data
import {
  AudioWaveform,
  BookOpen,
  Command,
  Frame,
  GalleryVerticalEnd,
  PieChart,
} from "lucide-react";

export const data = {
  user: {
    name: "Jürgen",
    email: "jürgen@kai.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Datenbank",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Chatbot",
          url: "/datenbank/objekte",
        },
        {
          title: "Nutzer",
          url: "/datenbank/nutzer",
        },
      ],
    },
  ],
  aiTools: [
    {
      name: "KI-Assistent",
      url: "/ki-tools/assistent",
      icon: Frame,
    },
    {
      name: "Abläufe",
      url: "/ki-tools/ablaeufe",
      icon: PieChart,
    },
  ],
};
