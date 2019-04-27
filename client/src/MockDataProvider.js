import PropTypes from 'prop-types'
import React from 'react'

import * as LoadState from './LoadState'
import StringUtils from './utils/StringUtils'
import { API, RequestHelper } from './services'

export default class MockDataProvider extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      user: {
        _id: 'user1',
        name: 'Ross Lynch',
        email: 'ross@example.com',
      },

      loading: true,

      requiredTransferWorkspaces: [],

      deleteWorkspaces: [],

      transferableMembers: [],

      fetchRelatedWorkspaces: async () => {
        const request = new RequestHelper()
        const url = StringUtils.format(API.fetchWorkspaces, this.state.user._id)
        const data = await request.get(url)
        this.setState({
          loading: false,
          requiredTransferWorkspaces: data.requiredTransferWorkspaces,
          deleteWorkspaces: data.deleteWorkspaces,
        })
      },

      transferOwnershipStatus: {
        workspaceId: null,
        toUserId: null,
        ...LoadState.pending,
      },

      transferOwnership: async (user, workspace) => {
        this.setState({
          transferOwnershipStatus: {
            workspaceId: workspace.spaceId,
            toUserId: this.state.user._id,
            ...LoadState.loading,
          },
        })
        const requestBody = {
          workspaceId: workspace.spaceId,
          fromUserId: this.state.user._id,
          toUserId: user._id,
        }
        const request = new RequestHelper()
        const response = await request.post(API.checkOwnership, requestBody)
        if (response.status === 200) {
          this.setState({
            transferOwnershipStatus: {
              workspaceId: workspace.spaceId,
              toUserId: user._id,
              ...LoadState.completed,
            },
          })
        } else {
          this.setState({
            transferOwnershipStatus: {
              workspaceId: workspace.spaceId,
              toUserId: user._id,
              status: LoadState.error,
            },
          })
        }
      },

      terminateAccount: async payload => {
        // Note that there is 30% chance of getting error from the server
        const request = new RequestHelper()
        const response = await request.post(API.terminateAccount, payload)
        if (response.status === 200) {
          this.setState({
            terminateAccountStatus: LoadState.handleLoaded(
              this.state.terminateAccountStatus
            ),
          })
        } else {
          this.setState({
            terminateAccountStatus: LoadState.handleLoadFailedWithError(
              'Error deleting account'
            )(this.state.terminateAccountStatus),
          })
        }
      },

      terminateAccountError: error => {
        this.setState({
          terminateAccountStatus: LoadState.handleLoadFailedWithError(error)(
            this.state.terminateAccountStatus
          ),
        })
      },

      terminateAccountStatus: {},
      resetTerminateAccountStatus: () => {
        this.setState({
          terminateAccountStatus: LoadState.pending,
          email: '',
        })
      },

      rediectToHomepage: () => {
        window.location = 'http://www.example.com/'
      },
    }
  }

  render() {
    return this.props.children(this.state)
  }
}
