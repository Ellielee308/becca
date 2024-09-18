import styled from "styled-components";
import { useState } from "react";
import imageIcon from "./images/photo.png";

export default function Preview({ currentStyle, currentTemplate }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped((prevState) => !prevState);
  };
  return (
    <Wrapper onClick={handleFlip}>
      <FlipCard isFlipped={isFlipped} currentStyle={currentStyle}>
        <FrontCard isFlipped={isFlipped} currentStyle={currentStyle}>
          {currentTemplate.frontFields.map((field, index) => (
            <FieldContainer
              key={index}
              style={field.style}
              position={field.position}
            >
              {renderFieldContent(field)}
            </FieldContainer>
          ))}
        </FrontCard>
        <BackCard isFlipped={isFlipped} currentStyle={currentStyle}>
          {currentTemplate.backFields.map((field, index) => (
            <FieldContainer
              key={index}
              style={field.style}
              position={field.position}
            >
              {renderFieldContent(field)}
            </FieldContainer>
          ))}
        </BackCard>
      </FlipCard>
    </Wrapper>
  );
}

const renderFieldContent = (field) => {
  switch (field.type) {
    case "text":
      return field.name; // 渲染文字內容
    case "image":
      return <Image src={imageIcon} alt={field.name} style={field.style} />;
    default:
      return null; // 如果類型未定義，不渲染任何內容
  }
};

const Wrapper = styled.div`
  align-self: center;
  display: block;
  margin: 52px 0px;
  width: 600px;
  height: 400px;
  perspective: 1000px;
  transform-style: preserve-3d;
  cursor: pointer;
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
  &:hover {
    transform: ${(props) => {
      switch (props.currentStyle.animation) {
        case "horizontalFlip":
          return props.isFlipped ? "rotateY(175deg)" : "rotateY(2deg)";
        case "fade":
          return "none";
        default: // "vertical"
          return props.isFlipped ? "rotateX(175deg)" : "rotateX(2deg)";
      }
    }};
    box-shadow: 0 20px 20px rgba(50, 60, 60, 0.2);
  }
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
  justify-content: ${(props) => props.style.textAlign || "center"};
  align-items: center;
  ${(props) =>
    props.style &&
    `
    width: ${props.style.width};
    height: ${props.style.height};
    font-size: ${props.style.fontSize};
    font-weight: ${props.style.fontWeight};
    color: ${props.style.color};
    background-color: ${props.style.backgroundColor};
  `};
  left: ${(props) => props.position?.x || "0"}px;
  top: ${(props) => props.position?.y || "0"}px;
`;

// 用於顯示圖片的樣式
const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: ${(props) => props.style?.objectFit || "cover"};
`;
