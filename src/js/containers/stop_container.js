import { connect } from 'react-redux';
import { stopTask } from '../actions';
import StopButton from '../components/stop_button';

const mapStateToProps = () => ({ });

const mapDispatchToProps = (dispatch) => ({
  stopTask: id => dispatch(stopTask(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StopButton);