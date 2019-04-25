import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'

import ConfirmEmailModal from './ConfirmEmailModal.react'
import TransferOwnershipModal, {
  WorkspaceGroupRows,
} from './TransferOwnershipModal.react'
import FeedbackSurveyModal from './FeedbackSurveyModal.react'
import { submitToSurveyMonkeyDeleteAccount } from './SurveyService'
import * as LoadState from './LoadState'
import AssignOwnership from './AssignOwnership.react'

class TerminateModalFlow extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    requiredTransferWorkspaces: PropTypes.array,
    deleteWorkspaces: PropTypes.array,
    fetchRelatedWorkspaces: PropTypes.func,
    transferOwnershipStatus: PropTypes.object,
    transferOwnership: PropTypes.func,
    terminateAccount: PropTypes.func,
    terminateAccountError: PropTypes.func,
    terminateAccountStatus: PropTypes.object,
    resetTerminateAccountStatus: PropTypes.func,
    rediectToHomepage: PropTypes.func,
  }

  state = {
    activeModal: 'transfer',
    transferData: [],
    feedbacks: [],
    comment: '',
    email: '',
  }

  componentDidMount() {
    this.props.fetchRelatedWorkspaces()
  }

  componentWillReceiveProps(nextProps) {
    if (LoadState.isLoaded(nextProps.terminateAccountStatus)) {
      this.props.rediectToHomepage()
    }
  }

  getTransferData = () => {
    const { workspaceId, toUserId, status } = this.props.transferOwnershipStatus
    const transferData = this.state.transferData
    const updateData = _.reduce(
      transferData,
      (result, assign) => {
        if (
          assign.workspaceId === workspaceId &&
          assign.toUser._id === toUserId
        ) {
          result.push(Object.assign({}, assign, { status }))
        } else {
          result.push(assign)
        }
        return result
      },
      []
    )
    return updateData
  }

  assignToUser = (workspace, user) => {
    const assigns = _.reject(
      this.getTransferData(),
      assign => assign.workspaceId === workspace.spaceId
    )
    this.setState({
      transferData: [
        ...assigns,
        {
          workspaceId: workspace.spaceId,
          toUser: user,
          ...LoadState.pending,
        },
      ],
    })
  }

  getRefsValues(refs, refName) {
    const item = _.get(refs, refName, false)
    if (!item || _.isEmpty(item.refs)) return {}

    const keys = Object.keys(item.refs)
    const collection = []
    for (const key of keys) {
      const value = item.refs[key].value
      collection.push({ key, value })
    }
    return collection
  }

  submitSurvey = async () => {
    const feedbackRefs = this.getRefsValues(this.refs, 'feedbackForm')
    const surveyPayload = {
      feedbackRefs,
      comment: this.state.comment,
    }
    await submitToSurveyMonkeyDeleteAccount(surveyPayload)
    this.setState({ activeModal: 'confirm' })
  }

  onSetNextPage = () => {
    const { activeModal } = this.state
    if (activeModal === 'transfer') {
      this.setState({ activeModal: 'feedback' })
    } else if (activeModal === 'feedback') {
      this.submitSurvey()
    }
  }

  onGoToPreviousStep = () => {
    if (this.state.activeModal === 'feedback') {
      this.setState({ activeModal: 'transfer' })
    }
    if (this.state.activeModal === 'confirm') {
      this.setState({ activeModal: 'feedback' })
    }
  }

  onAssignToUser = async (workspace, user) => {
    await this.props.transferOwnership(user, workspace)
    this.assignToUser(workspace, user)
  }

  onChangeComment = e => {
    this.setState({ comment: e.target.value })
  }

  onDeleteAccount = async () => {
    const { user, terminateAccount, terminateAccountError } = this.props
    const { email, feedbacks } = this.state

    if (user.email === email) {
      const payload = {
        transferTargets: _.map(this.getTransferData(), assign => ({
          userId: assign.toUser._id,
          spaceId: assign.workspaceId,
        })),
        reason: feedbacks,
      }
      terminateAccount(payload)
    } else {
      const error = 'Invalid email'
      terminateAccountError(error)
    }
  }

  onTypeEmail = e => {
    this.setState({ email: e.target.value })
  }

  renderTransferModal() {
    const {
      loading,
      requiredTransferWorkspaces,
      user,
      deleteWorkspaces,
    } = this.props
    const transferData = this.getTransferData()
    const totalAssigned = transferData.length
    const totalWorkspaceRequiredTransfer = requiredTransferWorkspaces.length
    const totalWorkspaceDelete = deleteWorkspaces.length
    const disabledNextPage =
      totalAssigned < totalWorkspaceRequiredTransfer || loading
    return (
      <TransferOwnershipModal
        nextPage={this.onSetNextPage}
        loading={loading}
        disabledNextPage={disabledNextPage}
      >
        <WorkspaceGroupRows
          workspaces={requiredTransferWorkspaces}
          groupTitle="The following workspaces require ownership transfer:"
          shouldDisplay={totalWorkspaceRequiredTransfer > 0}
        >
          <AssignOwnership
            user={user}
            transferData={transferData}
            onAssignToUser={this.onAssignToUser}
          />
        </WorkspaceGroupRows>
        <WorkspaceGroupRows
          workspaces={deleteWorkspaces}
          groupTitle="The following workspaces will be deleted:"
          shouldDisplay={totalWorkspaceDelete > 0}
        />
      </TransferOwnershipModal>
    )
  }

  render() {
    switch (this.state.activeModal) {
      case 'transfer':
        return this.renderTransferModal()
      case 'feedback':
        return (
          <FeedbackSurveyModal
            ref="feedbackForm"
            title="Why would you leave us?"
            onSubmit={this.onSetNextPage}
            onBackButton={this.onGoToPreviousStep}
            showCommentForm
            comment={this.state.comment}
            onChangeComment={this.onChangeComment}
          />
        )
      case 'confirm':
        const {
          terminateAccountStatus,
          resetTerminateAccountStatus,
        } = this.props
        return (
          <ConfirmEmailModal
            onClickToDelete={this.onDeleteAccount}
            onBackButton={this.onGoToPreviousStep}
            email={this.state.email}
            onTypeEmail={this.onTypeEmail}
            terminateAccountStatus={terminateAccountStatus}
            resetTerminateAccountStatus={resetTerminateAccountStatus}
          />
        )
    }
  }
}

export default TerminateModalFlow
