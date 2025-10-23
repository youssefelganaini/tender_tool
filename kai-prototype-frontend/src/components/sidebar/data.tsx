// sample data
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  PieChart,
  Settings2,
  SquareTerminal,
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
      title: "Buchhaltung",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Rechnungen",
          url: "/buchhaltung/rechnungen",
        },
        {
          title: "Bankumsätze",
          url: "/buchhaltung/bankumsaetze",
        },
        {
          title: "Kontensalden",
          url: "/buchhaltung/kontensalden",
        },
        {
          title: "Einstellungen",
          url: "/buchhaltung/einstellungen",
        },
      ],
    },
    {
      title: "CRM",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Tickets",
          url: "/crm/tickets",
        },
        {
          title: "Einstellungen",
          url: "/crm/einstellungen",
        },
      ],
    },
    {
      title: "Datenbank",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Objekte",
          url: "/datenbank/objekte",
        },
        {
          title: "Nutzer",
          url: "/datenbank/nutzer",
        },
        {
          title: "Unternehmen",
          url: "/datenbank/unternehmen",
        },
        {
          title: "Dokumente",
          url: "/datenbank/dokumente",
        },
      ],
    },
    {
      title: "Einstellungen",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Briefpapier",
          url: "/einstellungen/briefpapier",
        },
        {
          title: "Emails",
          url: "/einstellungen/emails",
        },
        {
          title: "Nutzer",
          url: "/einstellungen/nutzer",
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
