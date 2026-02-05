import React from 'react';
import styled from 'styled-components';
import CTAButton from '../../Components/Button/CTAButton';
import phoneMockup from '../../assets/images/Mescot.png';

const AddYourRestaurant = () => {
  return (
    <Section>
      <Container>
        <Row>
          <ImageSide>
            <PhoneContainer>
              <img src={phoneMockup} alt="FoodMenuBD     App" loading="lazy" />
            </PhoneContainer>
          </ImageSide>

          <TextSide>
            <Content>
              <Description>
                Enjoy the benefits of taking orders, pick-up, dine-in, and delivery options,
                all in one app for enhanced service and growth
              </Description>

              <Title>Add Your Restaurant</Title>

              {/* Reusable Button */}
              <CTAButton to="/addmenuform">
                Get Started
              </CTAButton>
            </Content>
          </TextSide>
        </Row>
      </Container>
    </Section>
  );
};

const Section = styled.section`
  position: relative;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;

  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ImageSide = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  position: relative;
  min-height: 600px;

  @media (max-width: 992px) {
    order: 2;
    min-height: auto;
  }
`;

const PhoneContainer = styled.div`
  position: relative;
  width: 380px;
  max-width: 100%;

  img {
    width: 100%;
    height: auto;
    border-radius: 44px;
    transition: all 0.4s ease;
  }

  @media (max-width: 480px) {
    width: 320px;
  }
`;

const TextSide = styled.div`
  flex: 1;
  padding-left: 40px;

  @media (max-width: 992px) {
    padding-left: 0;
    order: 1;
    margin-bottom: 50px;
  }
`;

const Content = styled.div`
  max-width: 520px;
`;

const Description = styled.p`
  font-size: 19px;
  color: #64748b;
  line-height: 1.8;
  margin-bottom: 30px;
  font-weight: 400;
  font-family: 'Gilroy', sans-serif;

  @media (max-width: 768px) {
    font-size: 17px;
  }
`;

const Title = styled.h2`
  font-size: 42px;
  font-weight: 600;
  color: black;
  margin: 0 0 40px 0;
  line-height: 1.2;
  font-family: 'Gilroy', sans-serif;
  letter-spacing: -1.5px;

  @media (max-width: 768px) {
    font-size: 42px;
  }
  @media (max-width: 480px) {
    font-size: 36px;
  }
`;

export default AddYourRestaurant;