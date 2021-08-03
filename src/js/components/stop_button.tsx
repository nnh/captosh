import React from 'react';
import { Button } from 'react-bootstrap';

const StopButton = ({ taskId, disabled, stopTask }) => (
  <Button bsStyle={disabled ? 'warning' : 'danger'} onClick={() => stopTask(taskId)} disabled={disabled}>中止</Button>
);

export default StopButton;