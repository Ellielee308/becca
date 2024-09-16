import styled from "styled-components";
import { useEffect, useState } from "react";
import Select from "react-select";
import { TwitterPicker } from "react-color";

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

const borderWidthOptions = [
  { value: "4px", label: "4px" },
  { value: "8px", label: "8px" },
  { value: "12px", label: "12px" },
  { value: "16px", label: "16px" },
  { value: "24px", label: "24px" },
  { value: "32px", label: "32px" },
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
  { value: "Noto Sans TC", label: "思源黑體" },
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
    borderStyle: "none",
    borderColor: "",
    borderWidth: "",
    borderRadius: "",
    backgroundColor: "#FFFFFF",
    fontFamily: "Arial",
    animation: "flip",
  });

  const [colorPickerVisible, setColorPickerVisible] = useState({
    borderColor: false,
    backgroundColor: false,
  });

  const [borderWidthPickerVisible, setBorderWidthPickerVisible] =
    useState(false);

  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleBorderStyleChange = (selectedOption) => {
    setStyle({ ...style, borderStyle: selectedOption.value });
  };

  // 顏色選擇處理函數
  const handleColorChange = (color, target) => {
    setStyle({ ...style, [target]: color.hex });
    setColorPickerVisible({ ...colorPickerVisible, [target]: false });
  };

  const handleRadiusChange = () => {
    setStyle({
      ...style,
      borderRadius: style.borderRadius === "25px" ? "" : "25px", // 切換選取狀態
    });
  };

  const handleOpenBorderWidthMenu = (e) => {
    if (style.borderStyle === "none") return;
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setPickerPosition({ top: rect.bottom + 5, left: rect.left - 30 });
    setBorderWidthPickerVisible((prevState) => !prevState);
  };

  const handleColorIconClick = (event, target) => {
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    setPickerPosition({ top: rect.bottom + 15, left: rect.left - 10 });
    setColorPickerVisible((prev) => ({
      ...prev,
      [target]: !prev[target],
    }));
  };

  const handleBorderWidthChange = (selectedOption) => {
    if (style.borderStyle === "none") return;
    setStyle({ ...style, borderWidth: selectedOption.value });
  };

  const handleFontChange = (selectedOption) => {
    setStyle({ ...style, fontFamily: selectedOption.value });
  };
  const handleAnimationChange = (selectedOption) => {
    setStyle({ ...style, animation: selectedOption.value });
  };

  const closeAllPickers = () => {
    setBorderWidthPickerVisible(false);
    setColorPickerVisible({
      borderColor: false,
      backgroundColor: false,
    });
  };

  const defaultBackgroundColors = [
    "#FFFFFF",
    "#f0f8ff",
    "#FAF0E6",
    "#FAF0E6", // Linen
    "#FFF5EE", // Seashell
    "#FFF8DC", // Cornsilk
    "#F5FFFA", // MintCream
    "#F0FFF0", // Honeydew
    "#FFFAF0", // FloralWhite
    "#F0FFFF", // Azure
    "#E6E6FA", // Lavender
    "#FFFACD", // LemonChiffon
    "#FFEFD5", // PapayaWhip
    "#E0FFFF", // LightCyan
    "#FFEBEE", // LightPink
    "#FFFDE7", // LightYellow
    "#E8F5E9", // LightGreen
  ];

  return (
    <ModalWrapper onClick={closeAllPickers}>
      <ModalContent onClick={closeAllPickers}>
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
              <RadiusIconWrapper
                isSelected={style.borderRadius !== ""}
                onClick={handleRadiusChange}
              >
                <IconImage src={borderRadiusIcon} />
              </RadiusIconWrapper>
              <BorderStyleIconWrapper
                onClick={handleOpenBorderWidthMenu}
                isDisabled={style.borderStyle === "none"}
              >
                <IconImage src={borderThicknessIcon} />
              </BorderStyleIconWrapper>
              <BorderStyleIconWrapper
                onClick={(e) => {
                  e.stopPropagation();
                  handleColorIconClick(e, "borderColor");
                }}
                isDisabled={style.borderStyle === "none"}
              >
                <IconImage src={borderColorIcon} />
              </BorderStyleIconWrapper>
              <IconWrapper
                onClick={(e) => {
                  e.stopPropagation();
                  handleColorIconClick(e, "backgroundColor");
                }}
              >
                <IconImage src={backgroundColorIcon} />
              </IconWrapper>
            </ColorGroup>
            <Select
              options={fontOptions}
              onChange={handleFontChange}
              styles={SelectFont}
              value={fontOptions.find(
                (option) => option.value === style.fontFamily
              )}
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
            <FlipIconImage src={FlipIcon} currentStyle={style} />
            <Card currentStyle={style}>
              <Text currentStyle={style}>Front Text</Text>
            </Card>
          </CardPreviewWrapper>
          {borderWidthPickerVisible && (
            <PickerContainer
              top={pickerPosition.top}
              left={pickerPosition.left}
              onClick={(e) => e.stopPropagation()}
            >
              <Select
                options={borderWidthOptions}
                onChange={handleBorderWidthChange}
              />
            </PickerContainer>
          )}
          {/* TwitterPicker 懸浮容器 */}
          {style.borderStyle !== "none" && colorPickerVisible.borderColor && (
            <PickerContainer
              top={pickerPosition.top}
              left={pickerPosition.left}
            >
              <TwitterPicker
                color={style.borderColor}
                onChange={(color) => handleColorChange(color, "borderColor")}
              />
            </PickerContainer>
          )}
          {colorPickerVisible.backgroundColor && (
            <PickerContainer
              top={pickerPosition.top}
              left={pickerPosition.left}
            >
              <TwitterPicker
                color={style.backgroundColor}
                onChange={(color) =>
                  handleColorChange(color, "backgroundColor")
                }
                colors={defaultBackgroundColors}
              />
            </PickerContainer>
          )}
          <SaveButton type="submit" value="儲存樣式" />
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
  height: 850px;
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
  cursor: pointer;
  position: relative;
`;

const BorderStyleIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  cursor: ${(props) => (props.isDisabled ? "not-allowed" : "pointer")};
  position: relative;
`;

const RadiusIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border: ${(props) => (props.isSelected ? "1px solid #c1c0c0" : "none")};
  border-radius: ${(props) => (props.isSelected ? "5px" : "none")};
  cursor: pointer;
  position: relative;
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
  margin-bottom: ${(props) =>
    props.currentStyle.borderWidth
      ? `calc(${props.currentStyle.borderWidth} + 8px)`
      : "8px"};
`;

const Card = styled.div`
  height: 600px;
  height: 400px;
  outline-style: ${(props) => props.currentStyle.borderStyle};
  outline-color: ${(props) => props.currentStyle.borderColor};
  outline-width: ${(props) => props.currentStyle.borderWidth};
  background-color: ${(props) => props.currentStyle.backgroundColor};
  border-radius: ${(props) => props.currentStyle.borderRadius};
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1),
    /* 淺陰影 */ 0 6px 20px rgba(0, 0, 0, 0.15); /* 深陰影 */
`;

const Text = styled.p`
  font-size: 60px;
  font-family: ${(props) => props.currentStyle.fontFamily};
`;

const PickerContainer = styled.div`
  position: fixed; /* 懸浮在其他元素上 */
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
  z-index: 1000; /* 確保在最上層 */
`;

const SaveButton = styled.input`
  margin-top: 30px;
  width: 100px;
  height: 40px;
  font-size: 16px;
  align-self: center;
  font-size: "Noto Sans TC", sans-serif;
`;
