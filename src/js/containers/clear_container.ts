import { connect } from 'react-redux';
import { clearView } from '../actions';

const mapStateToProps = () => ({ });

const mapDispatchToProps = (dispatch) => ({
  onClick: () => dispatch(clearView())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
