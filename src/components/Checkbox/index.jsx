"use client";
import { Container, HiddenCheckbox, StyledCheckbox, IconWrapper } from "./styles";
import { FaCheck } from "react-icons/fa";

export function Checkbox({ className, checked, disabled, ...props }) {
  return (
    <Container className={className} disabled={disabled}>
      <HiddenCheckbox checked={checked} disabled={disabled} {...props} />
      <StyledCheckbox checked={checked} disabled={disabled}>
        {checked && <IconWrapper><FaCheck /></IconWrapper>}
      </StyledCheckbox>
    </Container>
  );
}