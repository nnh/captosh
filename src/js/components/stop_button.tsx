import * as React from 'react';
import { Button } from 'react-bootstrap';
import { ConnectedProps } from 'react-redux';
import connector from '../containers/stop_container';

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = {
  taskId: number,
  disabled: boolean
} & PropsFromRedux;

const StopButton = ({ taskId, disabled, stopTask }: Props) => (
  <Button bsStyle={disabled ? 'warning' : 'danger'} onClick={() => stopTask(taskId)} disabled={disabled}>中止</Button>
);

export default connector(StopButton);
