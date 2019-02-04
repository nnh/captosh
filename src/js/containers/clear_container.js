import { connect } from 'react-redux';
import { clearView } from '../actions';
import ClearButton from '../components/clear_button';

const mapStateToProps = () => ({ });

const mapDispatchToProps = (dispatch) => ({
  onClick: () => dispatch(clearView())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClearButton);