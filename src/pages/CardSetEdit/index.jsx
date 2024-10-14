import styled from "styled-components";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import {
  getCardSet,
  getCardsOfCardSet,
  getTemplate,
  getUserCardStyles,
  getUserLabels,
  addNewLabel,
  updateCardSetWithNewCards,
} from "../../utils/api";
import Preview from "../../components/Preview.jsx";
import TemplatePreview from "../CardSetEdit/TemplatePreview.jsx";
import CardContent from "../CardSetEdit/CardContent.jsx";
import NewStyleModal from "../../components/NewStyleModal.jsx";
import { languageOptions } from "./options.js";
import { Link } from "react-router-dom";
import { ConfigProvider, Steps, message, Result } from "antd";

const customTheme = {
  token: {
    colorPrimary: "#3d5a80",
    borderRadius: 8,
    fontFamily: "'TaiwanPearl-Regular', 'Noto Sans TC', sans-serif;",
    fontSize: 16,
  },
};

function CardSetEdit() {
  const { cardSetId } = useParams();
  const { user, loading } = useUser();
  const [labelOptions, setLabelOptions] = useState([]);
  const [allStyles, setAllStyles] = useState([]);
  const [styleOptions, setStyleOptions] = useState([]);
  const [selectedStyleOption, setSelectedStyleOption] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState({});
  const [template, setTemplate] = useState({});
  const [cardContent, setCardContent] = useState([]);
  const [deletedCards, setDeletedCards] = useState([]); // 存儲要刪除的卡片 ID
  const [showNewStyleModal, setShowNewStyleModal] = useState(false);
  const [invalidFields, setInvalidFields] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [step, setStep] = useState(0);
  const [cardSetData, setCardSetData] = useState({
    cardSetId: "",
    title: "",
    description: "",
    purpose: "",
    visibility: "",
    labels: [],
    styleId: "",
    cardOrder: [],
    labelNames: [],
    lastEditedAt: "",
  });

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

          setCardSetData((prev) => ({
            ...prev,
            cardSetId: cardSet.cardSetId,
            title: cardSet.title,
            description: cardSet.description,
            purpose: cardSet.purpose,
            interfaceLanguage: cardSet.interfaceLanguage,
            learningLanguage: cardSet.learningLanguage,
            visibility: cardSet.visibility,
            labels: cardSet.labels,
            styleId: cardSet.styleId,
            cardOrder: cardSet.cardOrder,
            labelNames: cardSet.labelNames,
          }));

          setLabelOptions(
            userLabels.map((label) => ({
              value: label.labelId,
              label: label.name,
            }))
          );

          setAllStyles(userCardStyles);
          const defaultStyleId = "rvM8Fc1efHo7Ho7kf1gT";
          const cardStyleOptions = userCardStyles.map((userCardStyle) => ({
            value: userCardStyle.styleId,
            label: userCardStyle.styleName,
          }));
          // 將預設樣式排在第一個
          cardStyleOptions.sort((a, b) => {
            if (a.value === defaultStyleId) return -1; // 預設樣式排在第一
            if (b.value === defaultStyleId) return 1;
            return 0;
          });

          setStyleOptions(cardStyleOptions);

          const selectedStyle = userCardStyles.find(
            (style) => style.styleId === cardSet.styleId
          );
          setSelectedStyleOption(
            selectedStyle
              ? {
                  value: selectedStyle.styleId,
                  label: selectedStyle.styleName,
                }
              : null
          );
          setSelectedStyle(selectedStyle || {});
          setTemplate(cardSetTemplate);
          setCardContent(orderedCards);
          console.log("卡牌組資料獲取成功！");
        } catch (error) {
          console.error("獲取卡牌資料失敗：", error);
        }
      }
    };
    fetchCardSetData();
  }, [user, cardSetId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleStyleChange = (selectedOption) => {
    if (selectedOption.value === "newStyle") {
      setShowNewStyleModal(true); // 當選擇「新增樣式…」時顯示 Modal
    } else {
      setSelectedStyleOption(selectedOption);
      const selectedStyleObject = allStyles.find(
        (style) => style.styleName === selectedOption.label
      );
      setSelectedStyle(selectedStyleObject);
      setCardSetData({ ...cardSetData, styleId: selectedOption.value });
    }
  };

  const handleStyleAdded = (newStyle, styleId) => {
    setAllStyles((prevStyles) => [...prevStyles, newStyle]);
    setStyleOptions((prevOptions) => [
      ...prevOptions,
      { value: styleId, label: newStyle.styleName },
    ]);
    setSelectedStyleOption({ value: styleId, label: newStyle.styleName });
    setSelectedStyle(newStyle);
    setCardSetData({ ...cardSetData, styleId: styleId });
  };

  const handleCreateLabel = async (newLabel) => {
    const isLabelExist = labelOptions.some(
      (option) => option.label.toLowerCase() === newLabel.toLowerCase()
    );

    if (isLabelExist) {
      console.log("標籤已存在，不允許重複創建：", newLabel);
      messageApi.error("標籤已存在，不允許重複創建");
      return;
    }

    // 檢查是否含有特殊字元（允許字母、數字、空格，以及其他語言字符）
    const specialCharRegex = /^[\p{L}\p{N}\s]+$/u;
    if (!specialCharRegex.test(newLabel)) {
      console.log("標籤名稱含有不允許的特殊字元，創建失敗：", newLabel);
      messageApi.error("標籤名稱含有不允許的特殊字元，創建失敗");
      return;
    }
    try {
      const newLabelId = await addNewLabel({
        name: newLabel,
        createdBy: user.userId,
      });
      console.log("標籤已新增至資料庫：", newLabel);

      const newOption = { value: newLabelId, label: newLabel };
      setLabelOptions((prevOptions) => [...prevOptions, newOption]);

      setCardSetData((prevInfo) => ({
        ...prevInfo,
        labels: [...prevInfo.labels, { labelId: newLabelId, name: newLabel }],
        labelNames: [...prevInfo.labelNames, newLabel],
      }));
    } catch (error) {
      console.error("新增標籤失敗：", error);
    }
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   let newInvalidFields = [];

  //   if (cardSetData.title === "") {
  //     newInvalidFields.push("title");
  //   }
  //   if (cardSetData.purpose === "") {
  //     newInvalidFields.push("purpose");
  //   }
  //   if (cardSetData.visibility === "") {
  //     newInvalidFields.push("visibility");
  //   }
  //   if (cardSetData.styleId === "") {
  //     newInvalidFields.push("styleId");
  //   }
  //   if (cardSetData.fieldTemplateId === "") {
  //     newInvalidFields.push("fieldTemplateId");
  //   }
  //   if (cardSetData.purpose === "languageLearning") {
  //     if (!cardSetData.learningLanguage)
  //       newInvalidFields.push("learningLanguage");
  //     if (!cardSetData.interfaceLanguage)
  //       newInvalidFields.push("interfaceLanguage");
  //   }

  //   setInvalidFields(newInvalidFields);
  //   if (newInvalidFields.length > 0) return;
  //   //檢查卡牌組是否至少有一張
  //   if (cardContent.length < 1) {
  //     alert("字卡至少需要一張！");
  //     return;
  //   }
  //   // 檢驗正面是否必填格都有填
  //   for (let i = 0; i < template.frontFields.length; i++) {
  //     if (template.frontFields[i].required === true) {
  //       for (let y = 0; y < cardContent.length; y++) {
  //         // 檢查前端卡片的對應欄位是否有值
  //         if (
  //           !cardContent[y].frontFields[i] ||
  //           cardContent[y].frontFields[i].value.trim() === ""
  //         ) {
  //           alert("卡片有必填項未填！");
  //           return;
  //         }
  //       }
  //     }
  //   }
  //   // 檢驗背面是否必填格都有填
  //   for (let i = 0; i < template.backFields.length; i++) {
  //     if (template.backFields[i].required === true) {
  //       for (let y = 0; y < cardContent.length; y++) {
  //         // 檢查背面卡片的對應欄位是否有值
  //         if (
  //           !cardContent[y].backFields[i] ||
  //           cardContent[y].backFields[i].value.trim() === ""
  //         ) {
  //           alert("卡片有必填項未填！");
  //           return;
  //         }
  //       }
  //     }
  //   }
  //   //真正的提交邏輯
  //   try {
  //     await updateCardSetWithNewCards(
  //       cardSetData,
  //       cardContent,
  //       user.userId,
  //       deletedCards
  //     );
  //     alert("卡牌組更新成功！");
  //     navigate(`/cardset/${cardSetId}`);
  //   } catch (error) {
  //     console.error("更新過程出現錯誤：", error);
  //     alert("更新失敗，請重試。");
  //   }
  // };

  // 處理第一步提交
  const handleFirstStepSubmit = (event) => {
    event.preventDefault();
    let newInvalidFields = [];

    if (cardSetData.title === "") {
      newInvalidFields.push("title");
    }
    if (cardSetData.purpose === "") {
      newInvalidFields.push("purpose");
    }
    if (cardSetData.visibility === "") {
      newInvalidFields.push("visibility");
    }
    if (cardSetData.styleId === "") {
      newInvalidFields.push("styleId");
    }
    if (cardSetData.fieldTemplateId === "") {
      newInvalidFields.push("fieldTemplateId");
    }
    if (cardSetData.purpose === "languageLearning") {
      if (!cardSetData.learningLanguage)
        newInvalidFields.push("learningLanguage");
      if (!cardSetData.interfaceLanguage)
        newInvalidFields.push("interfaceLanguage");
    }

    setInvalidFields(newInvalidFields);
    if (newInvalidFields.length === 0) {
      setStep(1); // 若沒有錯誤，進入第二步
    }
  };

  // 處理第二步（卡片內容）提交
  const handleFinalSubmit = async (event) => {
    event.preventDefault();

    // 檢查卡片內容的有效性
    if (cardContent.length < 1) {
      messageApi.warning("字卡至少需要一張！");
      return;
    }

    // 檢查每張卡片的必填欄位
    for (let i = 0; i < template.frontFields.length; i++) {
      if (template.frontFields[i].required === true) {
        for (let y = 0; y < cardContent.length; y++) {
          if (
            !cardContent[y].frontFields[i] ||
            cardContent[y].frontFields[i].value.trim() === ""
          ) {
            messageApi.error("卡片有必填項未填！");
            return;
          }
        }
      }
    }

    for (let i = 0; i < template.backFields.length; i++) {
      if (template.backFields[i].required === true) {
        for (let y = 0; y < cardContent.length; y++) {
          if (
            !cardContent[y].backFields[i] ||
            cardContent[y].backFields[i].value.trim() === ""
          ) {
            messageApi.error("卡片有必填項未填！");
            return;
          }
        }
      }
    }

    // 最終提交邏輯
    try {
      messageApi.loading({
        content: "提交中，請稍候...",
        duration: 0, // 持續顯示，直到手動關閉
      });
      await updateCardSetWithNewCards(
        cardSetData,
        cardContent,
        user.userId,
        deletedCards
      );
      messageApi.destroy(); // 隱藏 loading
      messageApi.success("卡牌組編輯成功！");
      setStep(2); // 移動到第 3 步顯示結果
    } catch (error) {
      console.error("更新過程出現錯誤：", error);
      messageApi.destroy(); // 隱藏 loading
      messageApi.error("編輯失敗，請重試。");
    }
  };

  if (!user || loading || !labelOptions || !allStyles)
    return <div>Loading...</div>;

  return (
    <ConfigProvider theme={customTheme}>
      {contextHolder}
      <Background>
        <Wrapper>
          {step === 0 && (
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
                current={step}
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
                      setCardSetData({ ...cardSetData, title: e.target.value })
                    }
                    value={cardSetData.title}
                    $isInvalid={invalidFields.includes("title")}
                    id="title"
                    placeholder="請輸入標題"
                  />
                  <InputLabel htmlFor="description">簡介</InputLabel>
                  <Textarea
                    onChange={(e) =>
                      setCardSetData({
                        ...cardSetData,
                        description: e.target.value,
                      })
                    }
                    value={cardSetData.description}
                    id="description"
                    placeholder="請輸入簡介"
                  />
                  <InputLabel>
                    目的
                    <RequiredNotice>
                      {invalidFields.includes("purpose") ? " 必選項" : ""}
                    </RequiredNotice>
                  </InputLabel>
                  <RadioWrapper>
                    <InputRadio
                      type="radio"
                      id="languageLearning"
                      name="purpose"
                      value="languageLearning"
                      onChange={(e) => {
                        if (e.target.checked)
                          setCardSetData({
                            ...cardSetData,
                            purpose: "languageLearning",
                          });
                      }}
                      checked={cardSetData.purpose === "languageLearning"}
                    />
                    <InputLabel htmlFor="languageLearning">語言學習</InputLabel>
                    <InputRadio
                      type="radio"
                      id="others"
                      name="purpose"
                      value="others"
                      onChange={(e) => {
                        if (e.target.checked)
                          setCardSetData({
                            ...cardSetData,
                            purpose: "others",
                            learningLanguage: null,
                            interfaceLanguage: null,
                          });
                      }}
                      checked={cardSetData.purpose === "others"}
                    />
                    <InputLabel htmlFor="others">其他</InputLabel>
                  </RadioWrapper>
                  {cardSetData.purpose === "languageLearning" && (
                    <>
                      <InputLabel>
                        正面字卡顯示的語言
                        <RequiredNotice>*</RequiredNotice>
                      </InputLabel>
                      <Select
                        options={languageOptions}
                        onChange={(selectedOption) =>
                          setCardSetData({
                            ...cardSetData,
                            learningLanguage: selectedOption.value,
                          })
                        }
                        value={languageOptions.find(
                          (option) =>
                            option.value === cardSetData.learningLanguage
                        )}
                        styles={selectionStyle(
                          invalidFields.includes("learningLanguage")
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
                          setCardSetData({
                            ...cardSetData,
                            interfaceLanguage: selectedOption.value,
                          })
                        }
                        value={languageOptions.find(
                          (option) =>
                            option.value === cardSetData.interfaceLanguage
                        )}
                        styles={selectionStyle(
                          invalidFields.includes("learningLanguage")
                        )}
                        placeholder="請選擇語言"
                      />
                    </>
                  )}
                  <InputLabel>
                    隱私
                    <RequiredNotice>
                      {`*${
                        invalidFields.includes("visibility") ? " 必選項" : ""
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
                        if (e.target.checked)
                          setCardSetData({
                            ...cardSetData,
                            visibility: "public",
                          });
                      }}
                      checked={cardSetData.visibility === "public"}
                    />
                    <InputLabel htmlFor="public">公開</InputLabel>
                    <InputRadio
                      type="radio"
                      id="private"
                      name="visibility"
                      value="private"
                      onChange={(e) => {
                        if (e.target.checked)
                          setCardSetData({
                            ...cardSetData,
                            visibility: "private",
                          });
                      }}
                      checked={cardSetData.visibility === "private"}
                    />
                    <InputLabel htmlFor="private">私人</InputLabel>
                  </RadioWrapper>
                  <InputLabel htmlFor="label">標籤 (可複選) </InputLabel>
                  <CreatableSelect
                    id="label"
                    isMulti
                    options={labelOptions}
                    value={labelOptions.filter((option) =>
                      cardSetData.labels.some(
                        (label) => label.labelId === option.value
                      )
                    )}
                    onChange={(selectedOptions) => {
                      setCardSetData({
                        ...cardSetData,
                        labels: selectedOptions
                          ? selectedOptions.map((opt) => ({
                              labelId: opt.value,
                              name: opt.label,
                            }))
                          : [],
                        labelNames: selectedOptions
                          ? selectedOptions.map((opt) => opt.label)
                          : [],
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
                      ...styleOptions,
                      { value: "newStyle", label: "新增樣式..." },
                    ]}
                    value={selectedStyleOption}
                    onChange={handleStyleChange}
                  />
                </CardSetInfo>
                <InputLabel>預覽</InputLabel>
                {selectedStyle.styleName && template.templateName && (
                  <Preview
                    currentStyle={selectedStyle}
                    currentTemplate={template}
                  />
                )}
                {template.templateName && (
                  <TemplatePreview currentTemplate={template} />
                )}
                <Submit type="submit" value="下一步修改字卡內容" />
              </Form>
            </>
          )}
          {step === 1 && (
            <>
              <HeadingContainer>
                <Heading>
                  <EditIcon />
                  <p>編輯卡牌組</p>
                </Heading>
                <UpperButtonGroup>
                  <UpperPreviousStepButton
                    onClick={() => {
                      setStep(0);
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
                current={step}
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
                  currentTemplate={template}
                  cardContent={cardContent}
                  setCardContent={setCardContent}
                  isPurposeLanguageLearning={
                    cardSetData.purpose === "languageLearning"
                  }
                  interfaceLanguage={cardSetData.interfaceLanguage}
                  deletedCards={deletedCards}
                  setDeletedCards={setDeletedCards}
                />
                <ButtonGroup>
                  <PreviousStepButton
                    onClick={() => {
                      setStep(0);
                    }}
                  >
                    上一步
                  </PreviousStepButton>
                  <Submit type="submit" value="儲存" />
                </ButtonGroup>
              </Form>
            </>
          )}
          {step === 2 && (
            <>
              <HeadingContainer>
                <Heading>
                  <EditIcon />
                  <p>編輯卡牌組</p>
                </Heading>
              </HeadingContainer>
              <Steps
                current={step}
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
          {showNewStyleModal && styleOptions && (
            <NewStyleModal
              onClose={() => {
                setShowNewStyleModal(false);
              }}
              onStyleAdded={handleStyleAdded}
              styleNames={styleOptions.map((option) => option.label)}
            />
          )}
        </Wrapper>
      </Background>
    </ConfigProvider>
  );
}
export default CardSetEdit;

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
  /* box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); */
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
  /* background: linear-gradient(to right, #63b3ed, #4299e1); 漸層的天藍色 */
  background-color: #3d5a80;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  /* &:hover {
    background-color: #3182ce;
  } */

  /* &:active {
    background: linear-gradient(to right, #3182ce, #2b6cb0); 
    transform: translateY(2px); 
  } */
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
  width: 140px;
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
  text-decoration: none; // 移除連結預設的下劃線
  @media only screen and (max-width: 479px) {
    font-size: 14px;
  }
`;

const GoToMyCardSetsLink = styled(Link)`
  width: 140px;
  height: 36px;
  font-size: 16px;
  line-height: 16px;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: #666; // 灰色文字
  background-color: #e0e0e0; // 淺灰色背景
  border-radius: 8px;
  border: none;
  outline: none;
  user-select: none;
  cursor: pointer;
  margin-left: 16px; // 為了和「前往卡牌組」按鈕分開
  text-decoration: none; // 移除按鈕樣式中的下劃線
  &:hover {
    background-color: #d3d3d3; // hover 時的背景顏色
  }
  &:active {
    background-color: #c0c0c0; // active 時的背景顏色
  }
  @media only screen and (max-width: 479px) {
    font-size: 14px;
  }
`;
