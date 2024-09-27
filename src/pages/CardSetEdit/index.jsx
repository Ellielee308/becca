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
import Preview from "../CardSetEdit/Preview.jsx";
import TemplatePreview from "../CardSetEdit/TemplatePreview.jsx";
import CardContent from "../CardSetEdit/CardContent.jsx";
import NewStyleModal from "../CardSetEdit/NewStyleModal.jsx";
import { languageOptions } from "./options.js";
import { useNavigate } from "react-router-dom";

function CardSetEdit() {
  const { cardSetId } = useParams();
  const { user } = useUser();
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
  const navigate = useNavigate();
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
          setCardContent(cardsOfCardSet);
          console.log("卡牌組資料獲取成功！");
        } catch (error) {
          console.error("獲取卡牌資料失敗：", error);
        }
      }
    };
    fetchCardSetData();
  }, [user, cardSetId]);

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

  const handleSubmit = async (event) => {
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
    if (newInvalidFields.length > 0) return;
    //檢查卡牌組是否至少有一張
    if (cardContent.length < 1) {
      alert("字卡至少需要一張！");
      return;
    }
    // 檢驗正面是否必填格都有填
    for (let i = 0; i < template.frontFields.length; i++) {
      if (template.frontFields[i].required === true) {
        for (let y = 0; y < cardContent.length; y++) {
          // 檢查前端卡片的對應欄位是否有值
          if (
            !cardContent[y].frontFields[i] ||
            cardContent[y].frontFields[i].value.trim() === ""
          ) {
            alert("卡片有必填項未填！");
            return;
          }
        }
      }
    }
    // 檢驗背面是否必填格都有填
    for (let i = 0; i < template.backFields.length; i++) {
      if (template.backFields[i].required === true) {
        for (let y = 0; y < cardContent.length; y++) {
          // 檢查背面卡片的對應欄位是否有值
          if (
            !cardContent[y].backFields[i] ||
            cardContent[y].backFields[i].value.trim() === ""
          ) {
            alert("卡片有必填項未填！");
            return;
          }
        }
      }
    }
    //真正的提交邏輯
    try {
      await updateCardSetWithNewCards(
        cardSetData,
        cardContent,
        user.userId,
        deletedCards
      );
      alert("卡牌組更新成功！");
      navigate(`/cardset/${cardSetId}`);
    } catch (error) {
      console.error("更新過程出現錯誤：", error);
      alert("更新失敗，請重試。");
    }
  };

  if (!user || !labelOptions || !allStyles) return <div>Loading...</div>;

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit}>
        <HeadingWrapper>
          <Heading>編輯卡牌組</Heading>
          <Submit type="submit" value="儲存" />
        </HeadingWrapper>
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
        />
        <InputLabel htmlFor="description">簡介</InputLabel>
        <Textarea
          onChange={(e) =>
            setCardSetData({ ...cardSetData, description: e.target.value })
          }
          value={cardSetData.description}
          id="description"
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
                setCardSetData({ ...cardSetData, purpose: "languageLearning" });
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
              正面字卡顯示的字詞語言是什麼呢？<RequiredNotice>*</RequiredNotice>
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
                (option) => option.value === cardSetData.learningLanguage
              )}
              styles={selectionStyle(
                invalidFields.includes("learningLanguage")
              )}
            />
            <InputLabel>
              背面字卡顯示的字詞語言是什麼呢？<RequiredNotice>*</RequiredNotice>
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
                (option) => option.value === cardSetData.interfaceLanguage
              )}
              styles={selectionStyle(
                invalidFields.includes("learningLanguage")
              )}
            />
          </>
        )}
        <InputLabel>
          隱私
          <RequiredNotice></RequiredNotice>
        </InputLabel>
        <RadioWrapper>
          <InputRadio
            type="radio"
            id="public"
            name="visibility"
            value="public"
            onChange={(e) => {
              if (e.target.checked)
                setCardSetData({ ...cardSetData, visibility: "public" });
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
                setCardSetData({ ...cardSetData, visibility: "private" });
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
            cardSetData.labels.some((label) => label.labelId === option.value)
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
        <InputLabel>預覽</InputLabel>
        {selectedStyle.styleName && template.templateName && (
          <Preview currentStyle={selectedStyle} currentTemplate={template} />
        )}
        {template.templateName && (
          <TemplatePreview currentTemplate={template} />
        )}
        <InputLabel>
          字卡內容 (至少需要一張字卡)<RequiredNotice>*</RequiredNotice>
        </InputLabel>
        <CardContent
          currentTemplate={template}
          cardContent={cardContent}
          setCardContent={setCardContent}
          isPurposeLanguageLearning={cardSetData.purpose === "languageLearning"}
          interfaceLanguage={cardSetData.interfaceLanguage}
          deletedCards={deletedCards}
          setDeletedCards={setDeletedCards}
        />
        <Submit type="submit" value="儲存" />
      </Form>
      {showNewStyleModal && (
        <NewStyleModal
          onClose={() => {
            setShowNewStyleModal(false);
          }}
          onStyleAdded={handleStyleAdded}
        />
      )}
    </Wrapper>
  );
}
export default CardSetEdit;

const Wrapper = styled.div`
  margin: 80px auto;
  padding: 30px 20px;
  max-width: 1160px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const HeadingWrapper = styled.div`
  display: flex;
  margin-bottom: 30px;
  justify-content: space-between;
`;

const Heading = styled.h2`
  font-size: 32px;
  user-select: none;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputLabel = styled.label`
  margin-top: 12px;
  margin-bottom: 12px;
  font-size: 18px;

  &:first-of-type {
    margin-top: 0px;
  }
`;

const RequiredNotice = styled.span`
  margin-left: 5px;
  color: red;
`;

const Input = styled.input`
  font-family: "Noto Sans TC", sans-serif;
  height: 36px;
  padding: 0px 5px;
  border: ${(props) =>
    props.$isInvalid ? "solid 1px red" : "solid 1px #c1c0c0"};
  border-radius: 4px;
  font-size: 18px;
  &:focus {
    outline: 2px solid #2684ff;
  }
`;

const Textarea = styled.textarea`
  font-family: "Noto Sans TC", sans-serif;
  height: 130px;
  padding: 5px;
  border-radius: 4px;
  border: solid 1px #c1c0c0;
  outline: none;
  font-size: 18px;
  &:focus {
    outline: 2px solid #2684ff;
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
  align-self: center;
  margin-top: 10px;
  width: 128px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background-color: #c4e7ff;
  font-size: 16px;
  line-height: 16px;
  font-family: "Noto Sans TC", sans-serif;
  cursor: pointer;
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
