import styled from "styled-components";
import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext.jsx";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { languageOptions, templateOptions } from "./testOptions.js";
import TemplateEdit from "./TemplateEdit.jsx";
import Preview from "./Preview.jsx";
import CardContent from "./CardContent.jsx";
import NewStyleModal from "./NewStyleModal.jsx";
import { getUserCardStyles, addNewLabel } from "../../utils/api.js";

function CardSetCreate() {
  const { user, updateUser } = useUser();
  const [labelOptions, setLabelOptions] = useState([]);
  const [allStyles, setAllStyles] = useState([]);
  const [styleOptions, setStyleOptions] = useState([]);
  const [showNewStyleModal, setShowNewStyleModal] = useState(false);
  const [selectedStyleOption, setSelectedStyleOption] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState({});
  const [invalidFields, setInvalidFields] = useState([]);
  const [cardSetInfo, setCardSetInfo] = useState({
    cardSetId: "",
    userId: user ? user.userId : "",
    title: "",
    description: "",
    purpose: "",
    visibility: "",
    labels: [],
    styleId: "",
    fieldTemplateId: "",
    createdAt: "",
    cardOrder: [],
  });

  useEffect(() => {
    console.log("目前的用戶資料：", user);
    if (user && user.labels) {
      const labelOptions = user.labels.map((label) => ({
        value: label,
        label: label,
      }));
      setLabelOptions(labelOptions);
    }
    if (user) {
      const fetchUserCardStyles = async () => {
        try {
          const userCardStyles = await getUserCardStyles(user.userId); // 等待異步結果
          console.log("用戶的卡片樣式：", userCardStyles);
          setAllStyles(userCardStyles);

          const cardStyleOptions = userCardStyles.map((userCardStyle) => ({
            value: userCardStyle.styleId,
            label: userCardStyle.styleName,
          }));
          setStyleOptions(cardStyleOptions);
        } catch (error) {
          console.error("獲取卡片樣式失敗：", error);
        }
      };

      fetchUserCardStyles();
    }
  }, [user]);

  const handleStyleChange = (selectedOption) => {
    if (selectedOption.value === "newStyle") {
      setShowNewStyleModal(true); // 當選擇「新增樣式…」時顯示 Modal
    } else {
      setSelectedStyleOption(selectedOption);
      const selectedStyleObject = allStyles.find(
        (style) => style.styleId === selectedOption.value
      );
      setSelectedStyle(selectedStyleObject);
      setCardSetInfo({ ...cardSetInfo, styleId: selectedOption.value });
    }
  };

  const handleStyleAdded = (newStyle) => {
    setAllStyles((prevStyles) => [...prevStyles, newStyle]);
    setStyleOptions((prevOptions) => [
      ...prevOptions,
      { value: newStyle.styleId, label: newStyle.styleName },
    ]);
  };

  const handleCreateLabel = async (newLabel) => {
    try {
      await addNewLabel(newLabel, user.userId);
      console.log("標籤已新增至資料庫：", newLabel);
      const newOption = { value: newLabel, label: newLabel };
      setLabelOptions((prevOptions) => [...prevOptions, newOption]);
      setCardSetInfo((prevInfo) => ({
        ...prevInfo,
        labels: [...prevInfo.labels, newLabel],
      }));
      updateUser(user.userId);
    } catch (error) {
      console.error("新增標籤失敗：", error);
    }
  };

  return (
    <Wrapper>
      <Heading>新增卡牌組</Heading>
      <Form>
        <InputLabel htmlFor="title">標題</InputLabel>
        <Input
          type="text"
          id="title"
          onChange={(e) =>
            setCardSetInfo({ ...cardSetInfo, title: e.target.value })
          }
        />
        <InputLabel htmlFor="description">說明</InputLabel>
        <Textarea
          id="description"
          onChange={(e) =>
            setCardSetInfo({ ...cardSetInfo, description: e.target.value })
          }
        />
        <InputLabel>目的</InputLabel>
        <RadioWrapper>
          <InputRadio
            type="radio"
            id="languageLearning"
            name="purpose"
            value="languageLearning"
            onChange={(e) => {
              if (e.target.checked)
                setCardSetInfo({ ...cardSetInfo, purpose: "languageLearning" });
            }}
          />
          <InputLabel htmlFor="languageLearning">語言學習</InputLabel>
          <InputRadio
            type="radio"
            id="others"
            name="purpose"
            value="others"
            onChange={(e) => {
              if (e.target.checked)
                setCardSetInfo({ ...cardSetInfo, purpose: "others" });
            }}
          />
          <InputLabel htmlFor="others">其他</InputLabel>
        </RadioWrapper>
        {/* TODO: 另外處理切換成「其他」，語言要清空 */}
        {cardSetInfo.purpose === "languageLearning" && (
          <>
            <InputLabel htmlFor="label">你想要學習的語言是什麼？</InputLabel>
            <Select
              options={languageOptions}
              onChange={(selectedOption) =>
                setCardSetInfo({
                  ...cardSetInfo,
                  learningLanguage: selectedOption.value,
                })
              }
            />
            <InputLabel htmlFor="label">你想要以什麼語言學習呢？</InputLabel>
            <Select
              options={languageOptions}
              onChange={(selectedOption) =>
                setCardSetInfo({
                  ...cardSetInfo,
                  interfaceLanguage: selectedOption.value,
                })
              }
            />
          </>
        )}
        <InputLabel>隱私</InputLabel>
        <RadioWrapper>
          <InputRadio
            type="radio"
            id="public"
            name="visibility"
            value="public"
            onChange={(e) => {
              if (e.target.checked)
                setCardSetInfo({ ...cardSetInfo, visibility: "public" });
            }}
          />
          <InputLabel htmlFor="public">公開</InputLabel>
          <InputRadio
            type="radio"
            id="private"
            name="visibility"
            value="private"
            onChange={(e) => {
              if (e.target.checked)
                setCardSetInfo({ ...cardSetInfo, visibility: "private" });
            }}
          />
          <InputLabel htmlFor="private">私人</InputLabel>
        </RadioWrapper>
        <InputLabel htmlFor="label">標籤 (可複選) </InputLabel>
        <CreatableSelect
          id="label"
          isMulti
          options={labelOptions}
          value={labelOptions.filter((option) =>
            cardSetInfo.labels.includes(option.value)
          )}
          onChange={(selectedOptions) => {
            setCardSetInfo({
              ...cardSetInfo,
              labels: selectedOptions
                ? selectedOptions.map((opt) => opt.value)
                : [],
            });
          }}
          onCreateOption={handleCreateLabel} // 當創建新標籤時調用的處理程序
        />
        <InputLabel htmlFor="style">樣式</InputLabel>
        <Select
          id="style"
          options={[
            ...styleOptions,
            { value: "newStyle", label: "新增樣式..." },
          ]}
          value={selectedStyleOption}
          onChange={handleStyleChange}
        />
        <InputLabel>模板</InputLabel>
        <Select
          options={templateOptions}
          defaultValue={templateOptions[0]}
          onChange={(selectedOption) =>
            setCardSetInfo({
              ...cardSetInfo,
              fieldTemplateId: selectedOption.value,
            })
          }
        />
        <TemplateEdit />
        <InputLabel>預覽</InputLabel>
        {selectedStyle.styleId && <Preview currentStyle={selectedStyle} />}
        <InputLabel>字卡內容</InputLabel>
        <CardContent />
        <Submit type="submit" value="儲存" />
      </Form>
      {showNewStyleModal && (
        <NewStyleModal
          onClose={() => {
            setShowNewStyleModal(false);
            setSelectedStyleOption(null); // 重置選擇器為未選擇狀態
            setCardSetInfo({ ...cardSetInfo, styleId: "" });
          }}
          onStyleAdded={handleStyleAdded}
        />
      )}
    </Wrapper>
  );
}

export default CardSetCreate;

const Wrapper = styled.div`
  margin: 60px auto;
  padding: 30px 20px;
  max-width: 1160px;
  border: 1px solid black;
`;

const Heading = styled.h2`
  padding-bottom: 30px;
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

const Input = styled.input`
  height: 36px;
  padding: 0px 5px;
  border: solid 1px #c1c0c0;
  border-radius: 4px;
  font-size: 18px;
  &:focus {
    outline: 2px solid #2684ff;
  }
`;

const Textarea = styled.textarea`
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
  margin-top: 10px;
  align-self: center;
  width: 128px;
  height: 40px;
  font-size: 16px;
  line-height: 16px;
  font-family: "Noto Sans TC", sans-serif;
`;
