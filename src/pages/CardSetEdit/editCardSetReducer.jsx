export const initialState = {
  labelOptions: [],
  allStyles: [],
  styleOptions: [],
  selectedStyleOption: null,
  selectedStyle: {},
  template: {},
  cardContent: [],
  deletedCards: [],
  showNewStyleModal: false,
  invalidFields: [],
  step: 0,
  isSaving: false,
  cardSetData: {
    cardSetId: "",
    title: "",
    description: "",
    purpose: "",
    interfaceLanguage: "",
    learningLanguage: "",
    visibility: "",
    labels: [],
    styleId: "",
    cardOrder: [],
    labelNames: [],
  },
};

export function editCardSetReducer(state, action) {
  switch (action.type) {
    case "SET_LABEL_OPTIONS":
      return { ...state, labelOptions: action.payload };
    case "SET_ALL_STYLES":
      return { ...state, allStyles: action.payload };
    case "SET_STYLE_OPTIONS":
      return { ...state, styleOptions: action.payload };
    case "SET_SELECTED_STYLE_OPTION":
      return { ...state, selectedStyleOption: action.payload };
    case "SET_SELECTED_STYLE":
      return { ...state, selectedStyle: action.payload };
    case "SET_TEMPLATE":
      return { ...state, template: action.payload };
    case "SET_CARD_CONTENT":
      return { ...state, cardContent: action.payload };
    case "SET_DELETED_CARDS":
      return { ...state, deletedCards: action.payload };
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_SHOW_NEW_STYLE_MODAL":
      return { ...state, showNewStyleModal: action.payload };
    case "SET_INVALID_FIELDS":
      return { ...state, invalidFields: action.payload };
    case "UPDATE_CARD_SET_DATA":
      return {
        ...state,
        cardSetData: { ...state.cardSetData, ...action.payload },
      };
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
