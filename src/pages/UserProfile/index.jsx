import styled from "styled-components";

function UserProfile() {
  return (
    <Wrapper>
      <Title>用戶總覽</Title>
      <Split />
    </Wrapper>
  );
}

export default UserProfile;

const Wrapper = styled.div`
  margin-top: 80px;
  padding: 0 20px;
`;

const Title = styled.h2`
  font-size: 28px;
`;

const Split = styled.div`
  margin-top: 16px;
  border-top: 1px solid #c9c9c9;
  width: 100%;
`;
