import styled from "styled-components";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserCollection, getCardSet, getStyle } from "../../utils/api";
import { useUser } from "../../context/UserContext.jsx";

function UserCollection() {
  const { user } = useUser();

  const [userCollection, setUserCollection] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCollection = async () => {
      try {
        if (user && user.userId) {
          const collectionIds = await getUserCollection(user.userId);

          const collectionWithDetails = await Promise.all(
            collectionIds.map(async (cardSetId) => {
              const cardSet = await getCardSet(cardSetId);
              if (cardSet && cardSet.styleId) {
                const style = await getStyle(cardSet.styleId);
                return { ...cardSet, style };
              } else {
                return { ...cardSet, style: null };
              }
            })
          );
          console.log("獲取用戶收藏和樣式成功：", collectionWithDetails);
          setUserCollection(collectionWithDetails);
        }
      } catch (error) {
        console.error("獲取用戶收藏或樣式失敗：", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCollection();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  return (
    <Wrapper>
      <Title>收藏</Title>
      <Split />
      <CardGridWrapper>
        {userCollection &&
          userCollection.length > 0 &&
          userCollection.map((cardSet) => {
            return (
              <CardContainer key={cardSet.cardSetId}>
                <Link to={`/cardset/${cardSet.cardSetId}`}>
                  <CardWrapper $cardSetStyle={cardSet.style}>
                    {cardSet.title}
                  </CardWrapper>
                </Link>
                <CardSetDetailsContainer>
                  <Link to={`/cardset/${cardSet.cardSetId}`}>
                    <CardSetTitle>{cardSet.title}</CardSetTitle>
                  </Link>
                  <CardSetDescription>{cardSet.description}</CardSetDescription>
                  <LabelWrapper>
                    <LabelIconContainer>
                      <LabelIcon />
                    </LabelIconContainer>
                    <LabelNameContainer>
                      {cardSet.labels.length > 0 ? (
                        cardSet.labels.map((label, index) => (
                          <LabelName key={label.labelId}>
                            {label.name}
                            {index < cardSet.labels.length - 1 && ", "}
                          </LabelName>
                        ))
                      ) : (
                        <LabelName>無標籤</LabelName>
                      )}
                    </LabelNameContainer>
                  </LabelWrapper>
                </CardSetDetailsContainer>
              </CardContainer>
            );
          })}
        {userCollection && userCollection.length === 0 && (
          <div>目前沒有收藏的卡牌組，可以透過搜尋找到更多卡牌組哦！</div>
        )}
      </CardGridWrapper>
    </Wrapper>
  );
}

export default UserCollection;

const Wrapper = styled.div`
  margin: 80px 0 0 50px;
  padding: 0 80px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 500;
`;

const Split = styled.div`
  margin-top: 16px;
  border-top: 1px solid #c9c9c9;
  width: 100%;
`;

const CardGridWrapper = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const CardContainer = styled.div`
  width: 100%;
  padding: 20px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
`;

const CardWrapper = styled.div`
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.$cardSetStyle.borderRadius};
  border: ${(props) => props.$cardSetStyle.borderStyle};
  border-width: ${(props) => props.$cardSetStyle.$borderWidth};
  border-color: ${(props) => props.$cardSetStyle.borderColor};
  background-color: ${(props) => props.$cardSetStyle.backgroundColor};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CardSetDetailsContainer = styled.div`
  padding-top: 14px;
  display: flex;
  flex-direction: column;
`;

const CardSetTitle = styled.p`
  font-size: 16px;
`;

const CardSetDescription = styled.p`
  margin-top: 8px;
  font-size: 14px;
  text-align: justify;
  height: 60px;
  overflow: hidden;
  white-space: pre-line;
  color: gray;
`;

const LabelWrapper = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
`;

const LabelIconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
`;

const LabelNameContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const LabelName = styled.span`
  white-space: pre;
  color: gray;
  font-size: 14px;
`;

const LabelIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="18"
    height="18"
  >
    <path
      fillRule="evenodd"
      d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
      clipRule="evenodd"
    />
  </svg>
);
