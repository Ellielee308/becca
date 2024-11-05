export const initialState = {
  labelOptions: [],
  allStyles: [],
  styleOptions: [],
  selectedStyleOption: null,
  selectedStyle: {},
  allTemplates: [],
  templateOptions: [],
  selectedTemplateOption: null,
  selectedTemplate: {},
  showNewStyleModal: false,
  showNewTemplateModal: false,
  invalidFields: [],
  cardContent: [],
  suggestedTranslations: [],
  step: 0,
  newCardSetId: "",
  isSaving: false,
  cardSetData: {
    cardSetId: "",
    userId: "",
    title: "國中英文B2U5",
    description: "康軒版國中英文第二冊第五課",
    purpose: "",
    visibility: "",
    labels: [],
    styleId: "",
    fieldTemplateId: "",
    createdAt: "",
    cardOrder: [],
    labelNames: [],
  },
};

export function createCardSetReducer(state, action) {
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
    case "SET_ALL_TEMPLATES":
      return { ...state, allTemplates: action.payload };
    case "SET_TEMPLATE_OPTIONS":
      return { ...state, templateOptions: action.payload };
    case "SET_SELECTED_TEMPLATE_OPTION":
      return { ...state, selectedTemplateOption: action.payload };
    case "SET_SELECTED_TEMPLATE":
      return { ...state, selectedTemplate: action.payload };
    case "SET_CARD_CONTENT":
      return { ...state, cardContent: action.payload };
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SET_SUGGESTED_TRANSLATIONS":
      return { ...state, suggestedTranslations: action.payload };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_SHOW_NEW_STYLE_MODAL":
      return { ...state, showNewStyleModal: action.payload };
    case "SET_SHOW_NEW_TEMPLATE_MODAL":
      return { ...state, showNewTemplateModal: action.payload };
    case "SET_INVALID_FIELDS":
      return { ...state, invalidFields: action.payload };
    case "UPDATE_CARD_SET_DATA":
      return {
        ...state,
        cardSetData: { ...state.cardSetData, ...action.payload },
      };
    case "UPDATE_CARD_SET_ID":
      return { ...state, newCardSetId: action.payload };
    case "RESET_STATE":
      return initialState;
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
