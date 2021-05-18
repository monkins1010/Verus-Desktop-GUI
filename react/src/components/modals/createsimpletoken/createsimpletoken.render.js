import React from 'react';
import CommitNameForm from "../createIdentity/commitNameForm/commitNameForm";
import SimpleTokenForm from "../createsimpletoken/simpleTokenForm/simpleTokenForm";
import LaunchSimpleTokenForm from "../createsimpletoken/launchSimpleToken/launchSimpleTokenForm";
import RegisterSimpleTokenIdentityForm from "../createsimpletoken/registerSimpleToken/registerSimpleTokenForm";
import { CONFIRM_DATA, API_SUCCESS, SEND_RESULT, API_REGISTER_ID_NAME, API_RECOVER_ID, API_REGISTER_SIMPLE_TOKEN_ID, API_UPDATE_ID, API_CREATE_SIMPLE_TOKEN, API_LAUNCH_SIMPLE_TOKEN } from '../../../util/constants/componentConstants';
import Button from '@material-ui/core/Button';
import SimpleLoader from '../../../containers/SimpleLoader/SimpleLoader'
import UpdateIdentityForm from '../createIdentity/updateIdentityForm/updateIdentityForm';

export const CreateSimpleTokenRender = function() {
  const { advanceFormStep, state, back, props } = this
  const { loading, continueDisabled, formStep, txData } = state
  const { closeModal } = props

  return (
    <div style={{ width: "100%", paddingLeft: 35, paddingRight: 35 }}>
      {loading
        ? CreateIdentityRenderLoading.call(this)
        : CreateSimpleTokenFormRender.call(this)}
      {!loading && (
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between"
          }}
        >
          <Button
            variant="contained"
            onClick={back}
            size="large"
            color="default"
            style={{
              visibility:
                formStep === CONFIRM_DATA ||
                (formStep === SEND_RESULT && txData.status !== API_SUCCESS)
                  ? "unset"
                  : "hidden"
            }}
          >
            {"Back"}
          </Button>
          <Button
            variant="contained"
            onClick={ formStep === SEND_RESULT ? closeModal : advanceFormStep }
            disabled={continueDisabled}
            size="large"
            color="primary"
          >
            {formStep === SEND_RESULT ? "Done" : "Continue"}
          </Button>
        </div>
      )}
    </div>
  );
}

export const CreateSimpleTokenFormRender = function() {
  const { state, props, getFormData, getContinueDisabled, advanceFormStep } = this;
  const { modalProps, closeModal } = props;

  if (modalProps.modalType === API_REGISTER_ID_NAME) {
    return (
      <CommitNameForm
        {...modalProps}
        {...state}
        setFormData={getFormData}
        setContinueDisabled={getContinueDisabled}
      />
    );
  } else if (modalProps.modalType === API_REGISTER_SIMPLE_TOKEN_ID) {
    return (
      <RegisterSimpleTokenIdentityForm
        {...modalProps}
        {...state}
        setFormData={getFormData}
        setContinueDisabled={getContinueDisabled}
        advanceFormStep_trigger={advanceFormStep}
        closeModal_trigger={closeModal}
      />
    );
  } else if (modalProps.modalType === API_UPDATE_ID) {
    return (
      <UpdateIdentityForm 
        {...modalProps}
        {...state}
        setFormData={getFormData}
        setContinueDisabled={getContinueDisabled}
      />
    )
  } else if (modalProps.modalType === API_CREATE_SIMPLE_TOKEN) {
    return (
      <SimpleTokenForm 
        {...modalProps}
        {...state}
        setFormData={getFormData}
        setContinueDisabled={getContinueDisabled}
      />
    )
  } else if (modalProps.modalType === API_LAUNCH_SIMPLE_TOKEN) {
    return (
      <LaunchSimpleTokenForm 
        {...modalProps}
        {...state}
        setFormData={getFormData}
        setContinueDisabled={getContinueDisabled}
      />
    )
  }
};

export const CreateIdentityRenderLoading = function() {
  return (
    <div 
      className="d-sm-flex flex-column justify-content-sm-center"
      style={{ paddingBottom: 40, height: "100%" }}>
      <div
        className="d-flex d-sm-flex justify-content-center justify-content-sm-center"
        style={{ paddingBottom: 40 }}
      >
        <SimpleLoader size={75} text={"Loading..."}/>
      </div>
    </div>
  )
}


