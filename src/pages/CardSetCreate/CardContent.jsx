import styled from "styled-components";
import { DragIcon, TrashIcon, PlusIcon } from "./icon";

export default function CardContent() {
  return (
    <Wrapper>
      <CardWrapper>
        <TitleBar>
          <Heading>1</Heading>
          <ButtonGroupWrapper>
            <DragIcon />
            <TrashIcon />
          </ButtonGroupWrapper>
        </TitleBar>
        <SideWrapper>
          <Side>
            <SideHeading>正面</SideHeading>
            <TextInput placeholder="單字" />
          </Side>
          <SideSplit />
          <Side>
            <SideHeading>背面</SideHeading>
            <TextInput placeholder="字義" />
          </Side>
        </SideWrapper>
      </CardWrapper>
      <CardWrapper>
        <TitleBar>
          <Heading>2</Heading>
          <ButtonGroupWrapper>
            <DragIcon />
            <TrashIcon />
          </ButtonGroupWrapper>
        </TitleBar>
        <SideWrapper>
          <Side>
            <SideHeading>正面</SideHeading>
            <TextInput placeholder="單字" />
          </Side>
          <SideSplit />
          <Side>
            <SideHeading>背面</SideHeading>
            <TextInput placeholder="字義" />
          </Side>
        </SideWrapper>
      </CardWrapper>
      <CardWrapper>
        <TitleBar>
          <Heading>3</Heading>
          <ButtonGroupWrapper>
            <DragIcon />
            <TrashIcon />
          </ButtonGroupWrapper>
        </TitleBar>
        <SideWrapper>
          <Side>
            <SideHeading>正面</SideHeading>
            <TextInput placeholder="單字" />
          </Side>
          <SideSplit />
          <Side>
            <SideHeading>背面</SideHeading>
            <TextInput placeholder="字義" />
          </Side>
        </SideWrapper>
      </CardWrapper>
      <NewCardWrapper>
        <NewCardHeading>
          <PlusButton>
            <PlusIcon />
          </PlusButton>
          <PlusLabel>新增新卡片</PlusLabel>
        </NewCardHeading>
      </NewCardWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  align-self: center;
  display: flex;
  flex-direction: column;
  margin: 20px 0px;
  width: 600px;
  gap: 20px;
`;

const CardWrapper = styled.div`
  margin: 20px 0px;
  padding: 35px 0px;
  border: 1px solid #c2c2c2;
  width: 600px;
  min-height: 180px;
`;

const TitleBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
`;

const Heading = styled.p`
  font-size: 18px;
`;
const ButtonGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const SideWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: row;
`;

const Side = styled.div`
  padding: 0px 30px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const SideSplit = styled.div`
  height: 80px;
  border-left: 1px solid #c2c2c2;
`;

const SideHeading = styled.p`
  font-size: 18px;
  margin-bottom: 12px;
`;

const TextInput = styled.input`
  height: 30px;
  border: solid 1px #c1c0c0;
`;

const NewCardWrapper = styled.div`
  border: 1px solid #c2c2c2;
  width: 600px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const NewCardHeading = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const PlusButton = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  margin-right: 15px;
  align-items: center;
  justify-content: center;
  background-color: #adadad;
  border-radius: 4px;
`;

const PlusLabel = styled.p`
  font-size: 20px;
`;
