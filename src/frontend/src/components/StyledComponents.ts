import {styled} from "@mui/material";
import {Link} from "react-router-dom";
import myTheme from "../ThemeImporter";
const x = myTheme;
console.log(x);
export const StyledLink = styled(Link)`
  text-decoration: none;
  margin-left: 2px;
  margin-right: 5px;
  transition: text-decoration 0.2s ease;

  &:hover {
    text-decoration: underline;
  }
  color: ${myTheme.palette.warning.main}
`;