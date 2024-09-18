import styled from "styled-components";
import Select from "react-select";
import { useEffect, useState } from "react";
import { TwitterPicker } from "react-color";

const NewTemplateModal = ({ currentStyle, onClose }) => {
  const [invalidTemplateName, setInvalidTemplateName] = useState(false);
  const [newTemplateData, setNewTemplateData] = useState({
    fieldTemplateId: "", //自動生成
    userId: "MRvw8pLirv7B0y4zZlnB", //測試ID
    templateName: "",
    frontFields: [
      {
        name: "Front Text",
        type: "text",
        required: true, //驗證時是否為必填項
        position: { x: 50, y: 100 },
        style: {
          width: "300px", //容器寬度
          height: "200px", //容器高度
          fontSize: "24px",
          fontWeight: "bold",
          color: "#333333",
          textAlign: "center",
        },
      },
    ],
    backFields: [
      {
        name: "Back Text",
        type: "text",
        required: true, //驗證時是否為必填項
        position: { x: 50, y: 100 },
        style: {
          width: "300px", //容器寬度
          height: "200px", //容器高度
          fontSize: "24px",
          fontWeight: "bold",
          color: "#333333",
          textAlign: "center",
        },
      },
    ],
    createdAt: "",
  });

  const [isFlipped, setIsFlipped] = useState(false);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  const handleFlip = () => {
    setIsFlipped((prevState) => !prevState);
  };
  return (
    <ModalWrapper>
      <ModalContent>
        <Heading>新增模板</Heading>
        <CloseIcon onClick={onClose}>×</CloseIcon>
        <EditAreaWrapper>
          <Label>樣式名稱</Label>
          <TemplateNameInput
            onChange={(e) =>
              setNewTemplateData({
                ...newTemplateData,
                templateName: e.target.value,
              })
            }
          />
          {invalidTemplateName && (
            <InvalidFieldNotice>請填入模板名稱</InvalidFieldNotice>
          )}
          <SideFieldList>
            <SideField>
              <Label>正面</Label>
              <FieldList>
                <Label>No.</Label>
                <Label>欄位名稱</Label>
                <Label>類型</Label>
                <Label>是否為必填</Label>
                {newTemplateData.frontFields.map((frontField, index) => (
                  <>
                    <p key={`no-${index}`}>{index + 1}</p>
                    <p key={`name-${index}`}>{frontField.name}</p>
                    <p key={`type-${index}`}>
                      {frontField.type === "text" ? "文字" : "圖片"}
                    </p>
                    <p key={`required-${index}`}>
                      {frontField.required ? "是" : "否"}
                    </p>
                  </>
                ))}
              </FieldList>
            </SideField>
            <SideFieldListSplit />
            <SideField>
              <Label>背面</Label>
              <FieldList>
                <Label>No.</Label>
                <Label>欄位名稱</Label>
                <Label>類型</Label>
                <Label>是否為必填</Label>
                {newTemplateData.backFields.map((backField, index) => (
                  <>
                    <p key={`no-${index}`}>{index + 1}</p>
                    <p key={`name-${index}`}>{backField.name}</p>
                    <p key={`type-${index}`}>
                      {backField.type === "text" ? "文字" : "圖片"}
                    </p>
                    <p key={`required-${index}`}>
                      {backField.required ? "是" : "否"}
                    </p>
                  </>
                ))}
              </FieldList>
            </SideField>
          </SideFieldList>
          <Label>預覽</Label>
          <CardWrapper>
            <FlipCard isFlipped={isFlipped} currentStyle={currentStyle}>
              <FrontCard
                isFlipped={isFlipped}
                currentStyle={currentStyle}
              ></FrontCard>
              <BackCard
                isFlipped={isFlipped}
                currentStyle={currentStyle}
              ></BackCard>
            </FlipCard>
          </CardWrapper>
        </EditAreaWrapper>
        <SaveButton>儲存樣式</SaveButton>
      </ModalContent>
    </ModalWrapper>
  );
};

export default NewTemplateModal;

const Label = styled.label`
  font-size: 16px;
`;

const InvalidFieldNotice = styled.p`
  font-size: 12px;
  color: red;
  margin-top: 5px;
`;

const TemplateNameInput = styled.input`
  margin: 8px 10px 15px 2px;
  height: 28px;
  padding: 0px 5px;
  border: solid 1px #c1c0c0;
  border-radius: 4px;
  font-size: 18px;
  &:focus {
    outline: 2px solid #2684ff;
  }
`;

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background: white;
  padding: 40px;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  height: 900px;
  position: relative;
`;

const Heading = styled.h3`
  font-size: 20px;
  margin-bottom: 30px;
`;

const CloseIcon = styled.p`
  position: absolute;
  color: black;
  right: 40px;
  top: 40px;
  font-size: 28px;
  font-weight: 600;
  cursor: pointer;
`;

const EditAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const CardWrapper = styled.div`
  align-self: center;
  display: block;
  margin: 36px auto;
  width: 600px;
  height: 400px;
  perspective: 1000px;
  transform-style: preserve-3d;
`;

const FlipCard = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: ${(props) => {
    switch (props.currentStyle.animation) {
      case "fade":
        return "opacity 0.5s ease-in-out";
      default:
        return "all 0.5s ease-in-out";
    }
  }};
  transform: ${(props) => {
    switch (props.currentStyle.animation) {
      case "horizontalFlip":
        return props.isFlipped ? "rotateY(180deg)" : "rotateY(0)";
      case "fade":
        return "none";
      default: // "vertical"
        return props.isFlipped ? "rotateX(180deg)" : "rotateX(0)";
    }
  }};
  border-radius: ${(props) => props.currentStyle.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15);
`;

const FrontCard = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
  height: 100%;
  outline-style: ${(props) => props.currentStyle.borderStyle};
  outline-color: ${(props) => props.currentStyle.borderColor};
  outline-width: ${(props) => props.currentStyle.borderWidth};
  background-color: ${(props) => props.currentStyle.backgroundColor};
  border-radius: ${(props) => props.currentStyle.borderRadius};
  backface-visibility: hidden;
  font-family: ${(props) => props.currentStyle.fontFamily};
  font-size: 32px;
  opacity: ${(props) =>
    props.currentStyle.animation === "fade" && props.isFlipped ? 0 : 1};
  transition: ${(props) =>
    props.currentStyle.animation === "fade"
      ? "opacity 0.5s ease-in-out"
      : "none"};
`;

const BackCard = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
  height: 100%;
  outline-style: ${(props) => props.currentStyle.borderStyle};
  outline-color: ${(props) => props.currentStyle.borderColor};
  outline-width: ${(props) => props.currentStyle.borderWidth};
  background-color: ${(props) => props.currentStyle.backgroundColor};
  border-radius: ${(props) => props.currentStyle.borderRadius};
  backface-visibility: hidden;
  font-family: ${(props) => props.currentStyle.fontFamily};
  transform: ${(props) => {
    switch (props.currentStyle.animation) {
      case "horizontalFlip":
        return "rotateY(180deg)";
      case "fade":
        return "none";
      default: // "vertical"
        return "rotateX(180deg)";
    }
  }};
  font-size: 32px;
  opacity: ${(props) =>
    props.currentStyle.animation === "fade" ? (props.isFlipped ? 1 : 0) : 1};
  transition: ${(props) =>
    props.currentStyle.animation === "fade"
      ? "opacity 0.5s ease-in-out"
      : "none"};
  z-index: ${(props) => (props.isFlipped ? 3000 : 0)};
`;

const FieldContainer = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) => props.style && { ...props.style }}; /* 使用插入的樣式 */
  left: ${(props) => props.position?.x || "0"}px;
  top: ${(props) => props.position?.y || "0"}px;
`;

// 用於顯示圖片的樣式
const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: ${(props) => props.style?.objectFit || "cover"};
`;

const SideFieldList = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 40px;
`;

const SideField = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const FieldList = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 2fr 2fr;
  grid-row-gap: 10px;
`;

const SideFieldListSplit = styled.div`
  border-left: 1px solid gray;
  height: 80px;
  margin-right: 5px;
`;

const SaveButton = styled.div`
  background-color: #ddd8d8;
  width: fit-content;
  height: 25px;
  line-height: 25px;
  text-align: center;
  margin: 0 auto;
  cursor: pointer;
`;
