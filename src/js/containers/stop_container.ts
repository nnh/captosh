import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { stopTask } from '../actions';

const mapStateToProps = () => ({ });

const mapDispatchToProps = (dispatch: Dispatch) => ({
  stopTask: (id: number) => dispatch(stopTask(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
