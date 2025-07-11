import React from 'react';
import './FullLayout.css';
// import {
//   AppstoreOutlined,
//   BarChartOutlined,
//   CloudOutlined,
//   UploadOutlined,
//   UserOutlined,
//   VideoCameraOutlined,
// } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from '../page/dashboard';

const { Header, Content } = Layout;

const items = [
  {
    key: '/dashboard',
    // icon: <UserOutlined />,
    label: <Link to="/dashboard">DASHBOARD</Link>,
  },
  {
    key: '/management',
    // icon: <VideoCameraOutlined />,
    label: <Link to="/management">MANAGEMENT</Link>,
  },
  {
    key: '/history',
    // icon: <UploadOutlined />,
    label: <Link to="/history">HISTORY</Link>,
  },
  {
    key: '/setting',
    // icon: <BarChartOutlined />,
    label: <Link to="/setting">SETTING</Link>,
  },
  // {
  //   key: 'services',
  //   // icon: <AppstoreOutlined />,
  //   label: 'Services',
  //   children: [
  //     {
  //       key: 'A1',
  //       label: 'children1',
  //     },
  //     {
  //       key: 'A2',
  //       label: 'children2',
  //     },
  //   ],
  // },
];

const FullLayout: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();
  console.log("location part: ", location)

  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#FFF',
          paddingInline: '24px',
          color:'#FF995E'
        }}
      >
        <div
          style={{
            color: '#FF995E',
            fontWeight: 'bold',
            fontSize: '20px',
            marginRight: '24px',
          }}
        >
          MyApp
        </div>
        <Menu
          mode="horizontal"
          className='custom-menu'
          defaultSelectedKeys={[location.pathname]}
          selectedKeys={[location.pathname]}
          items={items}
          style={{ flex: 1,}}
        />
      </Header>

      <Content style={{ margin: '24px 16px', overflow: 'initial',height:"80vh" }}>
        <div
          style={{
            padding: 24,
            textAlign: 'center',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/management" element={<Dashboard />} />
            <Route path="/history" element={<Dashboard />} />
            <Route path="/setting" element={<Dashboard />} />
          </Routes>
          
        </div>
      </Content>
    </Layout>
  );
};

export default FullLayout;
