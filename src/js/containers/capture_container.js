import { connect } from 'react-redux';
import { addProgress, addResult, startCapture, endCapture } from '../actions';
import CaptureView from '../components/capture_view';

const mapStateToProps = (state) => ({
  captureTasks: state.captureTasks,
  result: state.resultText,
  capturing: state.captureState
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  startCapture: () => { dispatch(startCapture()) },
  endCapture: () => { dispatch(endCapture()) },
  count: (id, now) => { dispatch(addProgress(id, now) )},
  error: (text) => { dispatch(addResult(text)) }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CaptureView);