import * as React from 'react';
import { Button } from 'react-bootstrap';
import { ConnectedProps } from 'react-redux';
import connector from '../containers/clear_container';

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = {
  capturing: boolean,
  onClick: () => void, 
} & PropsFromRedux;

const ClearButton = ({ onClick, capturing }: Props) => (
  <Button bsStyle='default' onClick={onClick} disabled={capturing}>表示をクリア</Button>
);

export default connector(ClearButton);
