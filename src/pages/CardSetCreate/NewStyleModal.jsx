import styled from "styled-components";
import { useEffect } from "react";

const NewStyleModal = ({ onClose }) => {
  useEffect(() => {
    // 當 Modal 打開時，設置 body 的 overflow 為 hidden
    document.body.style.overflow = "hidden";

    // 當 Modal 關閉時，恢復 body 的 overflow
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <ModalWrapper>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Heading>新增樣式</Heading>
        <Form>
          <Label htmlFor="styleName">樣式名稱</Label>
          <StyleNameInput id="styleName" />
        </Form>
        <button onClick={onClose}>取消</button>
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
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  height: 500px;
`;

const Heading = styled.h3`
  font-size: 20px;
  margin-bottom: 30px;
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
