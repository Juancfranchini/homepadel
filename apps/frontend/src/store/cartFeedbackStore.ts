import { create } from 'zustand';

interface AddedItemFeedback {
  name: string;
  quantity: number;
  sequence: number;
}

interface CartFeedbackStore {
  addedItem: AddedItemFeedback | null;
  showAdded: (name: string, quantity: number) => void;
  clearAdded: (sequence: number) => void;
}

let sequence = 0;

export const useCartFeedbackStore = create<CartFeedbackStore>((set) => ({
  addedItem: null,
  showAdded: (name, quantity) => set({ addedItem: { name, quantity, sequence: ++sequence } }),
  clearAdded: (expectedSequence) => set((state) => (
    state.addedItem?.sequence === expectedSequence ? { addedItem: null } : state
  )),
}));
