import styled from "styled-components";
import { useEffect, useState } from "react";
import Select from "react-select";
import borderRadiusIcon from "./borderRadius.png";
import borderThicknessIcon from "./lineThickness.png";
import borderColorIcon from "./borderColorIcon.png";
import backgroundColorIcon from "./backgroundColor.png";
import FlipIcon from "./flipIcon.png";

const borderStyleOptions = [
  { value: "none", label: "無" },
  { value: "solid", label: "實線" },
  { value: "dashed", label: "虛線" },
  { value: "dotted", label: "圓點" },
  { value: "double", label: "雙實線" },
];

const fontOptions = [
  { value: "Arial", label: "Arial" },
  { value: "Oswald", label: "Oswald" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Raleway", label: "Raleway" },
  { value: "Poppins", label: "Poppins" },
];

const animationOptions = [
  { value: "flip", label: "翻轉" },
  { value: "fade", label: "淡入淡出" },
  { value: "slide", label: "滑動" },
  { value: "zoom", label: "縮放" },
];

const NewStyleModal = ({ onClose }) => {
  const [style, setStyle] = useState({
    styleName: "",
    borderStyle: "",
    borderColor: "#EDAFB8",
    borderWidth: "20px",
    borderRadius: "8px",
    backgroundColor: "#f0f8ff",
    fontFamily: "Arial",
    animation: "flip",
  });

  // export const defaultCardStyle = {
  //   styleId: "style123", //自動生成
  //   userId: "MRvw8pLirv7B0y4zZlnB",
  //   styleName: "預設模板",
  //   borderStyle: "solid",
  //   borderColor: "#EDAFB8",
  //   borderWidth: "20px",
  //   borderRadius: "8px",
  //   backgroundColor: "#FFFAF8",
  //   fontFamily: "Arial",
  //   animation: "flip",
  //   createdAt: "2024-09-03T12:34:56Z",
  // };

  useEffect(() => {
    // 當 Modal 打開時，頁面不能滑動
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleBorderStyleChange = (selectedOption) => {
    setStyle({ ...style, borderStyle: selectedOption.value });
  };
  const handleColorChange = (color) => {
    setStyle({ ...style, borderColor: color.hex });
  };
  const handleFontChange = (selectedOption) => {
    setStyle({ ...style, fontFamily: selectedOption.value });
  };
  const handleAnimationChange = (selectedOption) => {
    setStyle({ ...style, animation: selectedOption.value });
  };

  return (
    <ModalWrapper>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Heading>新增樣式</Heading>
        <CloseIcon onClick={onClose}>×</CloseIcon>
        <Form>
          <Label htmlFor="styleName">樣式名稱</Label>
          <StyleNameInput id="styleName" />
          <StyleOptionsWrapper>
            <Select
              options={borderStyleOptions}
              onChange={handleBorderStyleChange}
              styles={SelectBorderStyles}
              //   value={borderStyleOptions.find(
              //     (option) => option.value === style.borderStyle
              //   )} // 設定選擇器的值
              placeholder="邊框樣式"
            />
            <ColorGroup>
              <IconWrapper>
                <IconImage src={borderRadiusIcon} />
              </IconWrapper>
              <IconWrapper>
                <IconImage src={borderThicknessIcon} />
              </IconWrapper>
              <IconWrapper>
                <IconImage src={borderColorIcon} />
              </IconWrapper>
              <IconWrapper>
                <IconImage src={backgroundColorIcon} />
              </IconWrapper>
            </ColorGroup>
            <Select
              options={fontOptions}
              onChange={handleFontChange}
              styles={SelectFont}
              //   value={borderStyleOptions.find(
              //     (option) => option.value === style.borderStyle
              //   )} // 設定選擇器的值
              placeholder="字體"
            />
            <Select
              options={animationOptions}
              onChange={handleAnimationChange}
              styles={SelectFont}
              //   value={borderStyleOptions.find(
              //     (option) => option.value === style.borderStyle
              //   )} // 設定選擇器的值
              placeholder="動畫效果"
            />
          </StyleOptionsWrapper>
          <CardPreviewWrapper currentStyle={style}>
            <FlipIconImage src={FlipIcon} />
            <BorderStyle currentStyle={style}>
              <Card currentStyle={style}>
                <Text currentStyle={style}>Front Text</Text>
              </Card>
            </BorderStyle>
          </CardPreviewWrapper>
        </Form>
      </ModalContent>
    </ModalWrapper>
  );
};

export default NewStyleModal;

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
  height: 750px;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 16px;
`;

const StyleNameInput = styled.input`
  margin-top: 8px;
  height: 28px;
  padding: 0px 5px;
  border: solid 1px #c1c0c0;
  border-radius: 4px;
  font-size: 18px;
  &:focus {
    outline: 2px solid #2684ff;
  }
`;

const StyleOptionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 5px 5px;
  margin-top: 30px;
  height: 50px;
  width: 100%;
  border: solid 1px #f3f3f3;
`;

const ColorGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

const SelectBorderStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    width: "135px",
  }),
  option: (provided, state) => ({
    ...provided,
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 1000, // 選單的 z-index，以防止被其他元素遮蓋
  }),
};

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  /* border: 1px solid #ffc2c2; */
`;

const IconImage = styled.img`
  width: 24px;
  height: 24px;
`;

const SelectFont = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    width: "180px",
  }),
  option: (provided, state) => ({
    ...provided,
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 1000, // 選單的 z-index，以防止被其他元素遮蓋
  }),
};

const CardPreviewWrapper = styled.div`
  align-self: center;
  display: flex;
  flex-direction: column;
  margin: 20px 0px;
  width: 600px;
`;

const FlipIconImage = styled.img`
  align-self: flex-end;
  height: 24px;
  width: auto;
  cursor: pointer;
`;

const BorderStyle = styled.div`
  width: 600px;
  height: 400px;
  background-color: ${(props) => props.currentStyle.borderColor};
  padding: ${(props) => props.currentStyle.borderWidth};
`;

const Card = styled.div`
  height: 100%;
  background-color: ${(props) => props.currentStyle.backgroundColor};
  border-radius: ${(props) => props.currentStyle.borderRadius};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Text = styled.p`
  font-size: 60px;
  font-family: ${(props) => props.currentStyle.fontFamily};
`;
