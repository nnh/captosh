import React from 'react';
import { Button } from 'react-bootstrap';

const ClearButton = ({ onClick, capturing }) => (
  <Button bsStyle='default' onClick={onClick} disabled={capturing}>表示をクリア</Button>
);

export default ClearButton;