import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { clearView } from '../actions';

const mapStateToProps = () => ({ });

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClick: () => dispatch(clearView())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
