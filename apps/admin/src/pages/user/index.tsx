import { addUser, removeUser, queryUser, updateUser } from '@/services/user/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormSegmented,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, Drawer, Image, message, Tag } from 'antd';
import React, { useRef, useState } from 'react';


const statusValueEnum = {
  0: {
    text: '禁用',
    status: 'Default',
  },
  1: {
    text: '正常',
    status: 'Processing',
  },
}

const handleAdd = async (fields: API.UserItem) => {
  const hide = message.loading('正在添加...');
  try {
    await addUser({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

const handleUpdate = async ({ id, ...fields }: API.UserItem) => {
  const hide = message.loading('更新中...');
  try {
    await updateUser(id, {
      ...fields
    });
    hide();

    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

const handleRemove = async (selectedRows: API.UserItem[]) => {
  console.log("🚀 ~ handleRemove ~ selectedRows:", selectedRows)
  const hide = message.loading('正在删除...');
  if (!selectedRows) return true;
  try {
    await removeUser(selectedRows.map((row) => row.id));
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();

    return false;
  }
};

const TableList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.UserItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.UserItem[]>([]);

  const columns: ProColumns<API.UserItem>[] = [
    {
      title: '头像',
      dataIndex: 'avatar',
      hideInSearch: true,
      width: 80,
      align: 'center',
      render: (dom, entity) => {
        return (
          <Image
            width={80}
            src={entity.avatar}
          />
        );
      },
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 180,
      align: 'center',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (dom, entity) => {
        const text = entity.status === 1 ? '正常' : '禁用'
        const status = entity.status === 1 ? 'green' : 'red'
        return <Tag color={status}>{text}</Tag>
      },
    },
    {
      title: '创建时间',
      sorter: true,
      align: 'center',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 180,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      width: 100,
      render: (_, record) => [
        <a
          key="update"
          onClick={() => {
            setCurrentRow(record);
            handleUpdateModalOpen(true);
          }}
        >
          编辑
        </a>
      ],
    },
  ];

  return (
    <PageContainer header={{ title: '用户管理' }} >
      <ProTable<API.UserItem, API.PageParams>
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        request={queryUser}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        title={'新建用户'}
        width="400px"
        layout="horizontal"
        grid
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.UserItem);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: "用户名不能为空",
            },
          ]}
          label={"用户名"}
          colProps={{
            span: 24,
          }}
          name="username"
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: "密码不能为空",
            },
          ]}
          label={"密码"}
          colProps={{
            span: 24,
          }}
          name="password"
        />
        <ProFormText
          label={"描述"}
          colProps={{
            span: 24,
          }}
          name="desc"
        />
      </ModalForm>

      <ModalForm
        title={'更新用户'}
        width="400px"
        layout="horizontal"
        grid
        initialValues={currentRow}
        open={updateModalOpen}
        onOpenChange={handleUpdateModalOpen}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (value) => {
          console.log(value)
          const success = await handleUpdate({ id: currentRow?.id, ...value });
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: "昵称不能为空",
            },
          ]}
          label={"昵称"}
          colProps={{
            span: 24,
          }}
          name="username"
        />
        <ProFormText
          label={"描述"}
          colProps={{
            span: 24,
          }}
          name="desc"
        />
        <ProFormSegmented
          label={"状态"}
          colProps={{
            span: 24,
          }}
          name="status"
          valueEnum={statusValueEnum}
        />
      </ModalForm>

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.username && (
          <ProDescriptions<API.UserItem>
            column={1}
            title={currentRow?.username}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.username,
            }}
            columns={columns as ProDescriptionsItemProps<API.UserItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
