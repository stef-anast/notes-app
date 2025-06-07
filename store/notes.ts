import { defineStore } from "pinia";
import type { Note } from "~/types";
import { NoteType } from "~/types";

const initialNotes: Note[] = [
  {
    id: 1,
    title: "Professional Development Goals",
    type: NoteType.Default,
    description:
      "Strategic objectives for career advancement and skill enhancement. Focus areas include leadership development, technical certifications, and cross-functional collaboration opportunities.",
  },
  {
    id: 2,
    title: "Q4 Project Milestones",
    type: NoteType.Checkbox,
    description:
      "Key deliverables and checkpoints for the quarterly objectives. Track progress and ensure timely completion.",
    checkboxItems: [
      { id: "research", label: "Complete market research analysis" },
      { id: "proposal", label: "Submit project proposal for review" },
      { id: "stakeholder", label: "Schedule stakeholder meetings" },
      { id: "documentation", label: "Update project documentation" },
    ],
    selectedItems: ["research"],
  },
  {
    id: 3,
    title: "Team Collaboration Workshop",
    type: NoteType.Image,
    imageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop",
    description:
      "Documentation from our recent team building and collaboration workshop focused on improving communication and workflow efficiency.",
  },
  {
    id: 4,
    title: "Strategic Planning Session",
    type: NoteType.Default,
    description:
      "Notes from the annual strategic planning meeting. Key initiatives include digital transformation, sustainability goals, employee engagement programs, and market expansion strategies for the upcoming fiscal year.",
  },
  {
    id: 5,
    title: "Client Meeting Preparation",
    type: NoteType.Checkbox,
    description:
      "Essential preparation items for upcoming client presentations and meetings.",
    checkboxItems: [
      { id: "agenda", label: "Prepare meeting agenda" },
      { id: "materials", label: "Review presentation materials" },
      { id: "logistics", label: "Confirm meeting logistics" },
      { id: "followup", label: "Prepare follow-up action items" },
    ],
    selectedItems: ["agenda", "materials"],
  },
  {
    id: 6,
    title: "Innovation Brainstorming",
    type: NoteType.Default,
    description:
      "Creative ideas for process improvement and innovation initiatives. Exploring opportunities for automation, efficiency gains, and enhanced customer experience delivery.",
  },
  {
    id: 7,
    title: "Professional Office Environment",
    type: NoteType.Image,
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
    description:
      "Modern office workspace promoting collaboration and productivity. An example of effective workplace design and organization.",
  },
  {
    id: 8,
    title: "Business Analytics Dashboard",
    type: NoteType.Image,
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    description:
      "Visual representation of key performance indicators and business metrics for data-driven decision making and strategic planning.",
  },
];

export const useNotesStore = defineStore("notes", {
  state: () => ({
    notes: [...initialNotes] as Note[],
    selectedFilters: new Set<NoteType>(),
  }),

  getters: {
    findNote: (state) => {
      return (id: string | number) => {
        const noteId = typeof id === "string" ? parseInt(id, 10) : id;
        return state.notes.find((note) => note.id === noteId);
      };
    },

    filteredNotes: (state) => {
      if (state.selectedFilters.size === 0) {
        return state.notes;
      }
      return state.notes.filter((note) => state.selectedFilters.has(note.type));
    },
  },

  actions: {
    addNote(note: Omit<Note, "id">) {
      const lastId =
        this.notes.length > 0 ? Math.max(...this.notes.map((n) => n.id)) : 0;
      const newNote: Note = {
        ...note,
        id: lastId + 1,
      };
      this.notes.push(newNote);
    },

    updateNote(updatedNote: Note) {
      const index = this.notes.findIndex((note) => note.id === updatedNote.id);
      if (index !== -1) {
        this.notes[index] = updatedNote;
      }
    },

    deleteNote(noteId: string | number) {
      const id = typeof noteId === "string" ? parseInt(noteId, 10) : noteId;
      const index = this.notes.findIndex((note) => note.id === id);
      if (index !== -1) {
        this.notes.splice(index, 1);
      }
    },

    setFilters(filters: NoteType[]) {
      this.selectedFilters = new Set(filters);
    },

    addFilter(filter: NoteType) {
      this.selectedFilters.add(filter);
    },

    removeFilter(filter: NoteType) {
      this.selectedFilters.delete(filter);
    },
  },
});
