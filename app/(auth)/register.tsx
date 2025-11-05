import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";

export default function RegisterScreen() {
  const { user, loading, signUp } = useAuth();
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => { if (!loading && user) router.replace("/(tabs)"); }, [loading, user]);

  const onRegister = async () => {
    if (password !== confirm) return Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp");
    try { setSubmitting(true); await signUp(name, email, password); router.replace("/(tabs)"); }
    catch (e) { Alert.alert("Đăng ký thất bại", "Vui lòng thử lại"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <SafeAreaView style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator/></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex:1, padding:20, backgroundColor:"#f6f7fb" }}>
      <View style={{ flex:1, justifyContent:"center" }}>
        <Text style={{ fontSize:28, fontWeight:"800", marginBottom:20 }}>Tạo tài khoản</Text>
        <TextInput placeholder="Họ tên" value={name} onChangeText={setName}
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12, marginBottom:12, backgroundColor:"#fff" }} />
        <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12, marginBottom:12, backgroundColor:"#fff" }} />
        <TextInput placeholder="Mật khẩu (>=6)" secureTextEntry value={password} onChangeText={setPassword}
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12, marginBottom:12, backgroundColor:"#fff" }} />
        <TextInput placeholder="Nhập lại mật khẩu" secureTextEntry value={confirm} onChangeText={setConfirm}
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12, marginBottom:16, backgroundColor:"#fff" }} />
        <TouchableOpacity onPress={onRegister} disabled={submitting}
          style={{ backgroundColor:"#111827", padding:14, borderRadius:12, alignItems:"center" }}>
          {submitting ? <ActivityIndicator color="#fff"/> : <Text style={{ color:"#fff", fontWeight:"700" }}>Đăng ký</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
