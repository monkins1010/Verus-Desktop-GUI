import React from 'react';
import SimplecrowdfundForm from "../createsimplecrowdfund/simplecrowdfundForm/simplecrowdfundForm";
import LaunchSimplecrowdfundForm from "../createsimplecrowdfund/launchSimplecrowdfund/launchSimplecrowdfundForm";
import RegisterSimpleTokenIdentityForm from "../createsimpletoken/registerSimpleToken/registerSimpleTokenForm";
import { CONFIRM_DATA, API_SUCCESS, SEND_RESULT, API_REGISTER_SIMPLE_CROWDFUND_ID, API_CREATE_SIMPLE_CROWDFUND, API_LAUNCH_SIMPLE_CROWDFUND } from '../../../util/constants/componentConstants';
import Button from '@material-ui/core/Button';
import SimpleLoader from '../../../containers/SimpleLoader/SimpleLoader'


export const CreateSimplecrowdfundRender = function() {
  const { advanceFormStep, state, back, props } = this
  const { loading, continueDisabled, formStep, txData } = state
  const { closeModal } = props

  return (
    <div style={{ width: "100%", paddingLeft: 35, paddingRight: 35 }}>
      {loading
        ? CreateIdentityRenderLoading.call(this)
        : CreateSimplecrowdfundFormRender.call(this)}
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

export const CreateSimplecrowdfundFormRender = function() {
  const { state, props, getFormData, getContinueDisabled, advanceFormStep } = this;
  const { modalProps, closeModal } = props;

  if (modalProps.modalType === API_REGISTER_SIMPLE_CROWDFUND_ID) {
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
  } else if (modalProps.modalType === API_CREATE_SIMPLE_CROWDFUND) {
    return (
      <SimplecrowdfundForm 
        {...modalProps}
        {...state}
        setFormData={getFormData}
        setContinueDisabled={getContinueDisabled}
      />
    )
  } else if (modalProps.modalType === API_LAUNCH_SIMPLE_CROWDFUND) {
    return (
      <LaunchSimplecrowdfundForm 
        {...modalProps}
        {...state}
        setFormData={getFormData}
        setContinueDisabled={getContinueDisabled}
        advanceFormStep_trigger={advanceFormStep}
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
        <SimpleLoader size={75} text={"Please wait while crowdfund launch transaction is confirmed..."}/>
      </div>
    </div>
  )
}


