import { defineStore } from "pinia";

export enum NoteType {
  Default = 0,
  Image = 1,
  Checkbox = 2,
}

export interface Note {
  id: string | number;
  title: string;
  description?: string;
  type: NoteType;
  imageUrl?: string;
  imageAlt?: string;
  checkboxItems?: { id: string | number; label: string }[];
  selectedItems?: (string | number)[];
}

const initialNotes: Note[] = [
  {
    id: 1,
    title: "High-Five Moment",
    type: NoteType.Image,
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
    description:
      "A successful meeting concluding with a high-five. Represents teamwork and achievement.",
  },
  {
    id: 2,
    title: "Weekly Shopping List",
    type: NoteType.Checkbox,
    description:
      "Essential items to buy for the upcoming week. Check them off as you go.",
    checkboxItems: [
      { id: "milk", label: "Milk" },
      { id: "bread", label: "Bread" },
      { id: "cheese", label: "Cheese" },
    ],
    selectedItems: ["bread"],
  },
  {
    id: 3,
    title: "Project Brainstorm",
    type: NoteType.Default,
    description:
      "Initial ideas and concepts for the new project launch. Includes key performance indicators, target audience analysis, and marketing strategies to explore. More detailed planning to follow in subsequent meetings.",
  },
  {
    id: 4,
    title: "Team Presentation",
    type: NoteType.Image,
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1974&auto=format&fit=crop",
    description:
      "A snapshot from the last quarterly presentation. The team is discussing future goals and growth opportunities.",
  },
  {
    id: 5,
    title: "Cityscape View",
    type: NoteType.Image,
    imageUrl:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop",
    description:
      "An inspiring view of the city at sunset. A reminder of the scale and beauty of urban environments.",
  },
  {
    id: 6,
    title: "Stock Market Analysis",
    type: NoteType.Image,
    imageUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    description:
      "Tracking financial performance and market trends to make informed investment decisions.",
  },
  {
    id: 7,
    title: "Meeting Agenda",
    type: NoteType.Default,
    description:
      "Key discussion points for tomorrow's quarterly review meeting. Topics include budget allocation, team performance metrics, upcoming project deadlines, and resource planning for Q2.",
  },
  {
    id: 8,
    title: "Daily Tasks",
    type: NoteType.Checkbox,
    description: "Today's priority tasks and activities to complete.",
    checkboxItems: [
      { id: "email", label: "Check and respond to emails" },
      { id: "report", label: "Finish quarterly report" },
      { id: "meeting", label: "Prepare presentation slides" },
      { id: "review", label: "Review team proposals" },
    ],
    selectedItems: ["email"],
  },
];

export const useNotesStore = defineStore("notes", {
  state: () => ({
    notes: [...initialNotes] as Note[],
    selectedFilters: [] as NoteType[],
  }),

  getters: {
    findNote: (state) => {
      return (id: string | number) => {
        const noteId = typeof id === "string" ? parseInt(id, 10) : id;
        return state.notes.find((note) => note.id === noteId);
      };
    },

    filteredNotes: (state) => {
      if (state.selectedFilters.length === 0) {
        return state.notes;
      }
      return state.notes.filter((note) =>
        state.selectedFilters.includes(note.type)
      );
    },
  },

  actions: {
    addNote(note: Omit<Note, "id">) {
      const lastId =
        this.notes.length > 0
          ? Math.max(
              ...this.notes.map((n) => (typeof n.id === "number" ? n.id : 0))
            )
          : 0;
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
      const index = this.notes.findIndex((note) => note.id === noteId);
      if (index !== -1) {
        this.notes.splice(index, 1);
      }
    },

    setFilters(filters: NoteType[]) {
      this.selectedFilters = filters;
    },

    addFilter(filter: NoteType) {
      if (!this.selectedFilters.includes(filter)) {
        this.selectedFilters.push(filter);
      }
    },

    removeFilter(filter: NoteType) {
      this.selectedFilters = this.selectedFilters.filter((f) => f !== filter);
    },
  },
});
