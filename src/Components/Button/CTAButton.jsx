import { Link } from "react-router";
import styled from "styled-components";

const CTAButton = styled(Link)`
  display: inline-block;
  background: #b91c1c;
  color: white !important;
  font-size: 21px;
  font-weight: 700;
  padding: 20px 56px;
  border-radius: 60px;
  text-decoration: none;
  cursor: pointer;

  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 25px 50px rgba(220, 38, 38, 0.5);
  }
`;

export default CTAButton;
