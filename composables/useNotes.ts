import { ref } from "vue";

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

const notes = ref<Note[]>([
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
]);

export const useNotes = () => {
  const findNote = (id: string | number) => {
    const noteId = typeof id === "string" ? parseInt(id, 10) : id;
    return notes.value.find((note) => note.id === noteId);
  };

  const addNote = (note: Omit<Note, "id">) => {
    const lastId =
      notes.value.length > 0
        ? Math.max(
            ...notes.value.map((n) => (typeof n.id === "number" ? n.id : 0))
          )
        : 0;
    const newNote: Note = {
      ...note,
      id: lastId + 1,
    };
    notes.value.push(newNote);
  };

  const updateNote = (updatedNote: Note) => {
    const index = notes.value.findIndex((note) => note.id === updatedNote.id);
    if (index !== -1) {
      notes.value[index] = updatedNote;
    }
  };

  const deleteNote = (noteId: string | number) => {
    const index = notes.value.findIndex((note) => note.id === noteId);
    if (index !== -1) {
      notes.value.splice(index, 1);
    }
  };

  return {
    notes,
    findNote,
    addNote,
    updateNote,
    deleteNote,
  };
};
