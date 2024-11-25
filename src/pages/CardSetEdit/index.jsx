import { ConfigProvider, message, Result, Steps } from "antd";
import { useEffect, useReducer } from "react";
import { Link, useParams } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import styled from "styled-components";
import NewStyleModal from "../../components/NewStyleModal";
import Preview from "../../components/Preview";
import { useUser } from "../../context/UserContext.jsx";
import {
  addNewLabel,
  getCardSet,
  getCardsOfCardSet,
  getTemplate,
  getUserCardStyles,
  getUserLabels,
  updateCardSetWithNewCards,
} from "../../utils/api";
import CardContent from "../CardSetEdit/CardContent.jsx";
import TemplatePreview from "../CardSetEdit/TemplatePreview.jsx";
import { editCardSetReducer, initialState } from "./editCardSetReducer.jsx";

function CardSetEdit() {
  const { cardSetId } = useParams();
  const [state, dispatch] = useReducer(editCardSetReducer, initialState);
  const { user, loading } = useUser();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchCardSetData = async () => {
      if (user && user.userId && cardSetId) {
        try {
          const cardSet = await getCardSet(cardSetId);
          const cardsOfCardSet = await getCardsOfCardSet(cardSetId);
          const userCardStyles = await getUserCardStyles(user.userId);
          const userLabels = await getUserLabels(user.userId);
          const cardSetTemplate = await getTemplate(cardSet.fieldTemplateId);
          const orderedCards = cardSet.cardOrder
            .map((cardId) =>
              cardsOfCardSet.find((card) => card.cardId === cardId)
            )
            .filter(Boolean);

          dispatch({ type: "UPDATE_CARD_SET_DATA", payload: cardSet });
          dispatch({ type: "SET_ALL_STYLES", payload: userCardStyles });
          const labelOptions = userLabels.map((label) => ({
            value: label.labelId,
            label: label.name,
          }));
          dispatch({ type: "SET_LABEL_OPTIONS", payload: labelOptions });

          const defaultStyleId = "rvM8Fc1efHo7Ho7kf1gT";
          const cardStyleOptions = userCardStyles.map((userCardStyle) => ({
            value: userCardStyle.styleId,
            label: userCardStyle.styleName,
          }));
          cardStyleOptions.sort((a, b) => {
            if (a.value === defaultStyleId) return -1;
            if (b.value === defaultStyleId) return 1;
            return 0;
          });

          dispatch({ type: "SET_STYLE_OPTIONS", payload: cardStyleOptions });
          const selectedStyle = userCardStyles.find(
            (style) => style.styleId === cardSet.styleId
          );
          dispatch({
            type: "SET_SELECTED_STYLE_OPTION",
            payload: selectedStyle
              ? {
                  value: selectedStyle.styleId,
                  label: selectedStyle.styleName,
                }
              : null,
          });
          dispatch({
            type: "SET_SELECTED_STYLE",
            payload: selectedStyle || {},
          });
          dispatch({ type: "SET_TEMPLATE", payload: cardSetTemplate });
          dispatch({ type: "SET_CARD_CONTENT", payload: orderedCards });
        } catch (error) {
          console.error("獲取卡牌資料失敗：", error);
        }
      }
    };
    fetchCardSetData();
  }, [user, cardSetId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.step]);

  const handleStyleChange = (selectedOption) => {
    if (selectedOption.value === "newStyle") {
      dispatch({ type: "SET_SHOW_NEW_STYLE_MODAL", payload: true });
    } else {
      dispatch({ type: "SET_SELECTED_STYLE_OPTION", payload: selectedOption });
      const selectedStyleObject = state.allStyles.find(
        (style) => style.styleName === selectedOption.label
      );
      dispatch({ type: "SET_SELECTED_STYLE", payload: selectedStyleObject });
      dispatch({
        type: "UPDATE_CARD_SET_DATA",
        payload: { styleId: selectedOption.value },
      });
    }
  };

  const handleStyleAdded = (newStyle, styleId) => {
    dispatch({
      type: "SET_ALL_STYLES",
      payload: [...state.allStyles, newStyle],
    });

    dispatch({
      type: "SET_STYLE_OPTIONS",
      payload: [
        ...state.styleOptions,
        { value: styleId, label: newStyle.styleName },
      ],
    });

    dispatch({
      type: "SET_SELECTED_STYLE_OPTION",
      payload: { value: styleId, label: newStyle.styleName },
    });

    dispatch({
      type: "SET_SELECTED_STYLE",
      payload: newStyle,
    });

    dispatch({
      type: "UPDATE_CARD_SET_DATA",
      payload: { styleId: styleId },
    });
  };

  const handleCreateLabel = async (newLabel) => {
    const isLabelExist = state.labelOptions.some(
      (option) => option.label.toLowerCase() === newLabel.toLowerCase()
    );

    if (isLabelExist) {
      messageApi.error("標籤已存在，不允許重複創建");
      return;
    }

    const specialCharRegex = /^[\p{L}\p{N}\s]+$/u;
    if (!specialCharRegex.test(newLabel)) {
      messageApi.error("標籤名稱含有不允許的特殊字元，創建失敗");
      return;
    }
    try {
      const newLabelId = await addNewLabel({
        name: newLabel,
        createdBy: user.userId,
      });
      const newOption = { value: newLabelId, label: newLabel };
      dispatch({
        type: "SET_LABEL_OPTIONS",
        payload: [...state.labelOptions, newOption],
      });

      dispatch({
        type: "UPDATE_CARD_SET_DATA",
        payload: {
          labels: [
            ...state.cardSetData.labels,
            { labelId: newLabelId, name: newLabel },
          ],
          labelNames: [...state.cardSetData.labelNames, newLabel],
        },
      });
    } catch (error) {
      console.error("新增標籤失敗：", error);
    }
  };

  const handleFirstStepSubmit = (event) => {
    event.preventDefault();
    let newInvalidFields = [];

    if (state.cardSetData.title === "") {
      newInvalidFields.push("title");
    }
    if (state.cardSetData.purpose === "") {
      newInvalidFields.push("purpose");
    }
    if (state.cardSetData.visibility === "") {
      newInvalidFields.push("visibility");
    }
    if (state.cardSetData.styleId === "") {
      newInvalidFields.push("styleId");
    }
    if (state.cardSetData.fieldTemplateId === "") {
      newInvalidFields.push("fieldTemplateId");
    }
    if (state.cardSetData.purpose === "languageLearning") {
      if (!state.cardSetData.learningLanguage)
        newInvalidFields.push("learningLanguage");
      if (!state.cardSetData.interfaceLanguage)
        newInvalidFields.push("interfaceLanguage");
    }
    dispatch({ type: "SET_INVALID_FIELDS", payload: newInvalidFields });
    if (newInvalidFields.length === 0) {
      dispatch({ type: "SET_STEP", payload: 1 });
    }
  };

  const handleCardContentChange = (newContent) => {
    dispatch({
      type: "SET_CARD_CONTENT",
      payload: newContent,
    });
  };

  const handleDeletedCardsChange = (newDeletedCards) => {
    dispatch({
      type: "SET_DELETED_CARDS",
      payload: newDeletedCards,
    });
  };

  const handleFinalSubmit = async (event) => {
    event.preventDefault();
    if (state.isSaving) return;

    if (state.cardContent.length < 1) {
      messageApi.warning("字卡至少需要一張！");
      return;
    }

    for (let i = 0; i < state.template.frontFields.length; i++) {
      if (state.template.frontFields[i].required === true) {
        for (let y = 0; y < state.cardContent.length; y++) {
          if (
            !state.cardContent[y].frontFields[i] ||
            state.cardContent[y].frontFields[i].value.trim() === ""
          ) {
            messageApi.error("卡片有必填項未填！");
            return;
          }
        }
      }
    }

    for (let i = 0; i < state.template.backFields.length; i++) {
      if (state.template.backFields[i].required === true) {
        for (let y = 0; y < state.cardContent.length; y++) {
          if (
            !state.cardContent[y].backFields[i] ||
            state.cardContent[y].backFields[i].value.trim() === ""
          ) {
            messageApi.error("卡片有必填項未填！");
            return;
          }
        }
      }
    }
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      messageApi.loading({
        content: "提交中，請稍候...",
        duration: 0,
      });
      await updateCardSetWithNewCards(
        state.cardSetData,
        state.cardContent,
        user.userId,
        state.deletedCards
      );
      messageApi.destroy();
      messageApi.success("卡牌組編輯成功！");
      dispatch({ type: "SET_STEP", payload: 2 });
      dispatch({ type: "SET_SAVING", payload: false });
    } catch (error) {
      console.error("更新過程出現錯誤：", error);
      messageApi.destroy();
      messageApi.error("編輯失敗，請重試。");
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  if (!user || loading || !state.labelOptions || !state.allStyles)
    return <div>Loading...</div>;

  return (
    <ConfigProvider theme={customTheme}>
      {contextHolder}
      <Background>
        <Wrapper>
          {state.step === 0 && (
            <>
              <HeadingContainer>
                <Heading>
                  <EditIcon />
                  <p>編輯卡牌組</p>
                </Heading>
                <NextStepButton
                  type="submit"
                  value="下一步"
                  onClick={handleFirstStepSubmit}
                />
              </HeadingContainer>
              <Steps
                current={state.step}
                items={[
                  {
                    title: "基本資料",
                  },
                  {
                    title: "字卡內容",
                  },
                  {
                    title: "完成編輯卡牌組",
                  },
                ]}
              />
              <Form onSubmit={handleFirstStepSubmit}>
                <CardSetInfo>
                  <InputLabel htmlFor="title">
                    標題<RequiredNotice>*</RequiredNotice>
                  </InputLabel>
                  <Input
                    type="text"
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_CARD_SET_DATA",
                        payload: { title: e.target.value },
                      })
                    }
                    value={state.cardSetData.title}
                    $isInvalid={state.invalidFields.includes("title")}
                    id="title"
                    placeholder="請輸入標題"
                  />
                  <InputLabel htmlFor="description">簡介</InputLabel>
                  <Textarea
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_CARD_SET_DATA",
                        payload: { description: e.target.value },
                      })
                    }
                    value={state.cardSetData.description}
                    id="description"
                    placeholder="請輸入簡介"
                  />
                  <InputLabel>
                    目的
                    <RequiredNotice>
                      {`*${
                        state.invalidFields.includes("purpose") ? " 必選項" : ""
                      }`}
                    </RequiredNotice>
                  </InputLabel>
                  <RadioWrapper>
                    <InputRadio
                      type="radio"
                      id="languageLearning"
                      name="purpose"
                      value="languageLearning"
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch({
                            type: "UPDATE_CARD_SET_DATA",
                            payload: { purpose: "languageLearning" },
                          });
                        }
                      }}
                      checked={state.cardSetData.purpose === "languageLearning"}
                    />
                    <InputLabel htmlFor="languageLearning">語言學習</InputLabel>
                    <InputRadio
                      type="radio"
                      id="others"
                      name="purpose"
                      value="others"
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch({
                            type: "UPDATE_CARD_SET_DATA",
                            payload: {
                              purpose: "others",
                              learningLanguage: null,
                              interfaceLanguage: null,
                            },
                          });
                        }
                      }}
                      checked={state.cardSetData.purpose === "others"}
                    />
                    <InputLabel htmlFor="others">其他</InputLabel>
                  </RadioWrapper>
                  {state.cardSetData.purpose === "languageLearning" && (
                    <>
                      <InputLabel>
                        正面字卡顯示的語言
                        <RequiredNotice>*</RequiredNotice>
                      </InputLabel>
                      <Select
                        options={languageOptions}
                        onChange={(selectedOption) =>
                          dispatch({
                            type: "UPDATE_CARD_SET_DATA",
                            payload: {
                              learningLanguage: selectedOption.value,
                            },
                          })
                        }
                        value={languageOptions.find(
                          (option) =>
                            option.value === state.cardSetData.learningLanguage
                        )}
                        styles={selectionStyle(
                          state.invalidFields.includes("learningLanguage")
                        )}
                        placeholder="請選擇語言"
                      />
                      <InputLabel>
                        背面字卡顯示的語言
                        <RequiredNotice>*</RequiredNotice>
                      </InputLabel>
                      <Select
                        options={languageOptions}
                        onChange={(selectedOption) =>
                          dispatch({
                            type: "UPDATE_CARD_SET_DATA",
                            payload: {
                              interfaceLanguage: selectedOption.value,
                            },
                          })
                        }
                        value={languageOptions.find(
                          (option) =>
                            option.value === state.cardSetData.interfaceLanguage
                        )}
                        styles={selectionStyle(
                          state.invalidFields.includes("learningLanguage")
                        )}
                        placeholder="請選擇語言"
                      />
                    </>
                  )}
                  <InputLabel>
                    隱私
                    <RequiredNotice>
                      {`*${
                        state.invalidFields.includes("visibility")
                          ? " 必選項"
                          : ""
                      }`}
                    </RequiredNotice>
                  </InputLabel>
                  <RadioWrapper>
                    <InputRadio
                      type="radio"
                      id="public"
                      name="visibility"
                      value="public"
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch({
                            type: "UPDATE_CARD_SET_DATA",
                            payload: { visibility: "public" },
                          });
                        }
                      }}
                      checked={state.cardSetData.visibility === "public"}
                    />
                    <InputLabel htmlFor="public">公開</InputLabel>
                    <InputRadio
                      type="radio"
                      id="private"
                      name="visibility"
                      value="private"
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch({
                            type: "UPDATE_CARD_SET_DATA",
                            payload: { visibility: "private" },
                          });
                        }
                      }}
                      checked={state.cardSetData.visibility === "private"}
                    />
                    <InputLabel htmlFor="private">私人</InputLabel>
                  </RadioWrapper>
                  <InputLabel htmlFor="label">標籤 (可複選) </InputLabel>
                  <CreatableSelect
                    id="label"
                    isMulti
                    options={state.labelOptions}
                    value={state.labelOptions.filter((option) =>
                      state.cardSetData.labels.some(
                        (label) => label.labelId === option.value
                      )
                    )}
                    onChange={(selectedOptions) => {
                      dispatch({
                        type: "UPDATE_CARD_SET_DATA",
                        payload: {
                          labels: selectedOptions
                            ? selectedOptions.map((opt) => ({
                                labelId: opt.value,
                                name: opt.label,
                              }))
                            : [],
                          labelNames: selectedOptions
                            ? selectedOptions.map((opt) => opt.label)
                            : [],
                        },
                      });
                    }}
                    onCreateOption={handleCreateLabel}
                    placeholder="請輸入或選擇標籤"
                  />
                  <InputLabel>
                    樣式<RequiredNotice>*</RequiredNotice>
                  </InputLabel>
                  <Select
                    options={[
                      ...state.styleOptions,
                      { value: "newStyle", label: "新增樣式..." },
                    ]}
                    value={state.selectedStyleOption}
                    onChange={handleStyleChange}
                  />
                </CardSetInfo>
                <InputLabel>預覽</InputLabel>
                {state.selectedStyle.styleName &&
                  state.template.templateName && (
                    <Preview
                      currentStyle={state.selectedStyle}
                      currentTemplate={state.template}
                    />
                  )}
                {state.template.templateName && (
                  <TemplatePreview currentTemplate={state.template} />
                )}
                <Submit type="submit" value="下一步修改字卡內容" />
              </Form>
            </>
          )}
          {state.step === 1 && (
            <>
              <HeadingContainer>
                <Heading>
                  <EditIcon />
                  <p>編輯卡牌組</p>
                </Heading>
                <UpperButtonGroup>
                  <UpperPreviousStepButton
                    onClick={() => {
                      dispatch({ type: "SET_STEP", payload: 0 });
                    }}
                  >
                    上一步
                  </UpperPreviousStepButton>
                  <NextStepButton
                    type="submit"
                    onClick={handleFinalSubmit}
                    value="儲存"
                  />
                </UpperButtonGroup>
              </HeadingContainer>
              <Steps
                current={state.step}
                items={[
                  {
                    title: "基本資料",
                  },
                  {
                    title: "字卡內容",
                  },
                  {
                    title: "完成編輯卡牌組",
                  },
                ]}
              />
              <Form onSubmit={handleFinalSubmit}>
                <InputLabel>
                  字卡內容 (至少需要一張字卡)<RequiredNotice>*</RequiredNotice>
                </InputLabel>
                <CardContent
                  currentTemplate={state.template}
                  cardContent={state.cardContent}
                  setCardContent={handleCardContentChange}
                  isPurposeLanguageLearning={
                    state.cardSetData.purpose === "languageLearning"
                  }
                  interfaceLanguage={state.cardSetData.interfaceLanguage}
                  deletedCards={state.deletedCards}
                  setDeletedCards={handleDeletedCardsChange}
                />
                <ButtonGroup>
                  <PreviousStepButton
                    onClick={() => {
                      dispatch({ type: "SET_STEP", payload: 0 });
                    }}
                  >
                    上一步
                  </PreviousStepButton>
                  <Submit type="submit" value="儲存" />
                </ButtonGroup>
              </Form>
            </>
          )}
          {state.step === 2 && (
            <>
              <HeadingContainer>
                <Heading>
                  <EditIcon />
                  <p>編輯卡牌組</p>
                </Heading>
              </HeadingContainer>
              <Steps
                current={state.step}
                items={[
                  {
                    title: "基本資料",
                  },
                  {
                    title: "字卡內容",
                  },
                  {
                    title: "完成編輯卡牌組",
                  },
                ]}
              />
              <ResultWrapper>
                <Result status="success" title="成功編輯牌組！" />
                <ResultButtonGroup>
                  <GoToCardSetLink to={`/cardset/${cardSetId}`}>
                    前往卡牌組
                  </GoToCardSetLink>
                  <GoToMyCardSetsLink to={"/user/me/cardsets"}>
                    我的卡牌組頁面
                  </GoToMyCardSetsLink>
                </ResultButtonGroup>
              </ResultWrapper>
            </>
          )}
          {state.showNewStyleModal && state.styleOptions && (
            <NewStyleModal
              onClose={() => {
                dispatch({
                  type: "SET_SHOW_NEW_STYLE_MODAL",
                  payload: false,
                });
              }}
              onStyleAdded={handleStyleAdded}
              styleNames={state.styleOptions.map((option) => option.label)}
            />
          )}
        </Wrapper>
      </Background>
    </ConfigProvider>
  );
}

export default CardSetEdit;

const customTheme = {
  token: {
    colorPrimary: "#3d5a80",
    borderRadius: 8,
    fontFamily: "'TaiwanPearl-Regular', 'Noto Sans TC', sans-serif;",
    fontSize: 16,
  },
};

const languageOptions = [
  { value: "en", label: "英語" },
  { value: "zh-TW", label: "繁體中文" },
  { value: "ko", label: "韓語" },
  { value: "ja", label: "日語" },
  { value: "fr", label: "法語" },
  { value: "de", label: "德語" },
  { value: "es", label: "西班牙語" },
  { value: "th", label: "泰語" },
  { value: "it", label: "義大利語" },
  { value: "pt", label: "葡萄牙語" },
  { value: "others", label: "其他" },
];

const Background = styled.div`
  background-color: #eff7ff;
  width: 100%;
  height: fit-content;
  padding: 80px 20px 20px 20px;
`;

const Wrapper = styled.div`
  margin: 0 auto;
  padding: 30px 20px;
  max-width: 1160px;
  border: 1px solid #e6e3e1;
  border-radius: 8px;
  background-color: white;
`;

const HeadingContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: start;
`;

const Heading = styled.h2`
  padding-bottom: 30px;
  user-select: none;
  font-weight: 400;
  font-size: 32px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  white-space: pre-line;
  color: #293241;
  display: flex;
  gap: 12px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 8px;
`;

const CardSetInfo = styled.div`
  display: flex;
  flex-direction: column;
  @media only screen and (min-width: 640px) {
    display: grid;
    gap: 15px;
    grid-template-columns: 1fr 4fr;
    align-items: center;
  }
`;

const InputLabel = styled.label`
  margin-top: 12px;
  margin-bottom: 12px;
  font-size: 18px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
`;

const RequiredNotice = styled.span`
  margin-left: 5px;
  color: red;
  font-size: 16px;
`;

const Input = styled.input`
  height: 36px;
  padding: 0px 5px;
  border: none;
  border-bottom: ${(props) =>
    props.$isInvalid ? "solid 1px red" : "solid 1px #c1c0c0"};
  font-size: 14px;
  &:focus {
    outline: none;
  }
  font-family: "Noto Sans TC", sans-serif;
`;

const Textarea = styled.textarea`
  font-family: "Noto Sans TC", sans-serif;
  height: 130px;
  padding: 5px;
  border-radius: 4px;
  border: solid 1px #c1c0c0;
  outline: none;
  font-size: 14px;
  &:focus {
    outline: none;
  }
`;
const InputRadio = styled.input`
  margin-right: 10px;
  margin-left: 10px;
  &:first-of-type {
    margin-left: 0px;
  }
`;

const RadioWrapper = styled.div``;

const Submit = styled.input`
  padding: 0 14px;
  margin-top: 20px;
  align-self: center;
  min-width: 128px;
  height: 45px;
  font-size: 16px;
  line-height: 16px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: white;
  background-color: #3d5a80;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
`;

const selectionStyle = (isInvalid) => ({
  control: (provided, state) => ({
    ...provided,
    borderColor: isInvalid ? "red" : provided.borderColor,
    "&:hover": {
      borderColor: isInvalid
        ? "red"
        : state.isFocused
        ? provided.borderColor
        : provided.borderColor,
    },
  }),
});

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="32"
    height="32"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
    />
  </svg>
);

const NextStepButton = styled.input`
  width: 90px;
  height: 36px;
  font-size: 16px;
  line-height: 16px;
  font-weight: 400;
  text-align: center;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: white;
  background-color: #3d5a80;
  border-radius: 8px;
  border: none;
  outline: none;
  user-select: none;
  cursor: pointer;
  @media only screen and (max-width: 639px) {
    display: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 auto;
  width: 500px;
  justify-content: space-around;
  @media only screen and (max-width: 639px) {
    width: 100%;
  }
`;

const PreviousStepButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 14px;
  margin-top: 20px;
  min-width: 128px;
  height: 45px;
  font-size: 16px;
  line-height: 16px;
  font-weight: 400;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: white;
  background-color: #3d5a80;
  border-radius: 8px;
  cursor: pointer;
`;

const UpperButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 36px;
  @media only screen and (max-width: 639px) {
    display: none;
  }
`;

const UpperPreviousStepButton = styled.div`
  width: 90px;
  height: 36px;
  font-size: 16px;
  line-height: 16px;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: white;
  background-color: #3d5a80;
  border-radius: 8px;
  border: none;
  outline: none;
  user-select: none;
  cursor: pointer;
  @media only screen and (max-width: 639px) {
    display: none;
  }
`;

const ResultWrapper = styled.div`
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ResultButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 32px;
  width: 360px;
  justify-content: space-around;
  @media only screen and (max-width: 549px) {
    width: 80%;
  }
`;

const GoToCardSetLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 140px;
  height: 50px;
  font-size: 16px;
  font-weight: 400;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: white;
  background-color: #3d5a80;
  border-radius: 8px;
  border: none;
  outline: none;
  user-select: none;
  cursor: pointer;
  text-decoration: none;
  @media only screen and (max-width: 479px) {
    font-size: 14px;
  }
`;

const GoToMyCardSetsLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 140px;
  height: 50px;
  font-size: 16px;
  font-weight: 400;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: #666;
  background-color: #e0e0e0;
  border-radius: 8px;
  border: none;
  outline: none;
  user-select: none;
  cursor: pointer;
  margin-left: 16px;
  text-decoration: none;
  &:hover {
    background-color: #d3d3d3;
  }
  &:active {
    background-color: #c0c0c0;
  }
  @media only screen and (max-width: 479px) {
    font-size: 14px;
  }
`;
