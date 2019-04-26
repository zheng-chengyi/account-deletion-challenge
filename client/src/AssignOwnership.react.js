import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'

import * as LoadState from './LoadState'

class AssignOwnership extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    workspace: PropTypes.object,
    transferData: PropTypes.array,
    onAssignToUser: PropTypes.func,
    transferOwnershipStatus: PropTypes.object,
  }

  getAddedMember() {
    const { workspace, transferData } = this.props
    return _.chain(transferData)
      .reject(LoadState.isError || LoadState.isLoading)
      .find(assign => assign.workspaceId === workspace.spaceId)
      .get('toUser._id', '')
      .value()
  }

  onAssignToUser = e => {
    const user = this.props.workspace.transferableMembers.find(
      user => user._id === e.target.value
    )
    this.props.onAssignToUser(this.props.workspace, user)
  }

  renderError() {
    const user = this.props.workspace.transferableMembers.filter(
      user => user._id === this.props.transferOwnershipStatus.toUserId
    )
    return user.length > 0 ? (
      <span style={{ color: 'red' }}>{`Unable to assign to ${
        user[0].name
      }`}</span>
    ) : null
  }

  render() {
    return (
      <div style={{ textDecoration: 'underline', cursor: 'pointer' }}>
        <select
          value={this.getAddedMember()}
          onChange={this.onAssignToUser}
          style={{ minWidth: '3rem' }}
        >
          <option value="" disabled />
          {this.props.workspace.transferableMembers.map(user => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
        {this.props.transferOwnershipStatus.status === 'error' &&
          this.renderError()}
      </div>
    )
  }
}

export default AssignOwnership
