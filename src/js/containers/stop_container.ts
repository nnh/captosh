import { connect } from 'react-redux';
import { stopTask } from '../actions';

const mapStateToProps = () => ({ });

const mapDispatchToProps = (dispatch) => ({
  stopTask: (id: number) => dispatch(stopTask(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
