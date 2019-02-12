import { connect } from 'react-redux';
import { addProgress, startCapture, endCapture } from '../actions';
import CaptureView from '../components/capture_view';

const mapStateToProps = (state) => ({
  captureTasks: state.captureTasks,
  result: state.resultText,
  capturing: state.captureState
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  startCapture: () => { dispatch(startCapture()) },
  endCapture: () => { dispatch(endCapture()) },
  count: (id, result) => { dispatch(addProgress(id, result) )}
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CaptureView);