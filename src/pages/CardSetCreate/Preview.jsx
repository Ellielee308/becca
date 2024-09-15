import styled from "styled-components";
import FlipIcon from "./flipIcon.png";

export default function Preview({ currentStyle }) {
  return (
    <Wrapper currentStyle={currentStyle}>
      <Icon src={FlipIcon} />
      <BorderStyle currentStyle={currentStyle}>
        <Card currentStyle={currentStyle}>
          <Text currentStyle={currentStyle}>Text</Text>
        </Card>
      </BorderStyle>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  align-self: center;
  display: flex;
  flex-direction: column;
  margin: 20px 0px;
  width: 600px;
`;

const Icon = styled.img`
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
`;

const Text = styled.p`
  font-size: 32px;
  font-family: ${(props) => props.currentStyle.fontFamily};
`;

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
